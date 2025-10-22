import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

// API Error types
export interface ApiErrorData {
  message?: string;
  details?: any;
  errors?: any[];
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
  recoveryOptions?: {
    action: 'retry' | 'refresh' | 'redirect' | 'clear-cache';
    data?: any;
  };
}

export interface RequestTransform {
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
}

export interface ResponseTransform {
  (response: AxiosResponse): AxiosResponse | Promise<AxiosResponse>;
}

export interface ErrorTransform {
  (error: AxiosError<ApiErrorData>): Promise<never>;
}

// Constants
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create headers instance with safe merging
const createHeaders = (baseHeaders: Record<string, string> = {}): AxiosHeaders => {
  const headers = new AxiosHeaders();
  
  // Ensure we only set valid header values
  Object.entries(baseHeaders).forEach(([key, value]) => {
    if (key && value != null && typeof value !== 'undefined') {
      // Normalize header keys
      const normalizedKey = key.toLowerCase();
      // Filter out sensitive headers
      if (!normalizedKey.includes('cookie') && !normalizedKey.includes('auth-token')) {
        headers.set(key, String(value));
      }
    }
  });
  
  return headers;
};

// Add default headers and configuration
export const addDefaultHeaders: RequestTransform = (config) => {
  const headers = createHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': '1.0.0',
    ...config.headers as Record<string, string>
  });

  return {
    ...config,
    timeout: config.timeout || DEFAULT_TIMEOUT,
    headers,
    validateStatus: (status) => status >= 200 && status < 300,
  };
};

// Extend axios config type to include retries
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    retries?: number;
  }
}

// Add auth token if available
export const addAuthToken: RequestTransform = (config) => {
  let token: string | null = null;
  try {
    token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  } catch (error) {
    console.warn('Failed to access localStorage:', error);
  }

  if (token) {
    const headers = createHeaders({
      ...config.headers as Record<string, string>,
      Authorization: `Bearer ${token}`
    });
    return { ...config, headers };
  }
  return config;
};

// Retry logic for failed requests
const retryRequest = async (error: AxiosError): Promise<boolean> => {
  const config = error.config;
  if (!config) return false;
  
  const retries = config.retries || 0;
  if (retries >= MAX_RETRIES) return false;
  
  // Use exponential backoff with jitter to prevent thundering herd
  const delay = Math.min(
    RETRY_DELAY * Math.pow(2, retries) + Math.random() * 1000,
    30000 // Max 30 seconds
  );
  
  config.retries = retries + 1;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Don't retry if we got cancelled
  if (error.code === 'ECONNABORTED') return false;
  
  return true;
};

// Handle response data transformation
export const transformResponse: ResponseTransform = (response) => {
  if (response.data) {
    const data = { ...response.data };
    
    // Remove sensitive data
    delete data.internal_id;
    delete data.internal_notes;
    
    // Format dates
    if (data.created_at) {
      data.created_at = new Date(data.created_at).toISOString();
    }
    if (data.updated_at) {
      data.updated_at = new Date(data.updated_at).toISOString();
    }
    
    response.data = data;
  }
  return response;
};

// Custom error handler with retry logic
export const handleApiError: ErrorTransform = async (error: AxiosError<ApiErrorData>) => {
  // Handle request timeout
  if (error.code === 'ECONNABORTED') {
    throw {
      code: 'TIMEOUT',
      message: 'Request timed out. Please try again.',
      retryable: true,
      recoveryOptions: {
        action: 'retry',
        data: { 
          delay: 1000,
          backoff: true 
        }
      }
    } as ApiErrorResponse;
  }

  // Handle network errors with retry
  if (!error.response) {
    const canRetry = await retryRequest(error);
    if (canRetry && error.config) {
      throw error; // This will trigger axios to retry with the updated config
    }
    throw {
      code: 'NETWORK_ERROR',
      message: 'Network error occurred. Please check your connection.',
      retryable: true,
      recoveryOptions: {
        action: 'retry',
        data: { 
          clearCache: true,
          delay: 2000,
          backoff: true 
        }
      }
    } as ApiErrorResponse;
  }

  const { status, data = {} } = error.response;

  // Log error for debugging in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error(`API Error [${status}]:`, {
      url: error.config?.url,
      method: error.config?.method,
      status,
      data
    });
  }

  let errorResponse: ApiErrorResponse;
  switch (status) {
    case 400:
      errorResponse = {
        code: 'BAD_REQUEST',
        message: data.message || 'Invalid request',
        details: data.details
      };
      break;

    case 401:
      // Handle unauthorized access
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          // Use a more graceful way to handle navigation
          const event = new CustomEvent('auth:expired', { detail: { returnUrl: window.location.pathname } });
          window.dispatchEvent(event);
        }
      } catch (storageError) {
        console.warn('Failed to clear auth token:', storageError);
      }
      errorResponse = {
        code: 'UNAUTHORIZED',
        message: 'Your session has expired. Please log in again.',
        retryable: false,
        recoveryOptions: {
          action: 'redirect',
          data: {
            path: '/login',
            returnUrl: typeof window !== 'undefined' ? window.location.pathname : '/'
          }
        }
      };
      break;

    case 403:
      errorResponse = {
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource.',
        retryable: false
      };
      break;

    case 404:
      errorResponse = {
        code: 'NOT_FOUND',
        message: data.message || 'Resource not found',
        retryable: false
      };
      break;

    case 422:
      errorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: data.details || data.errors,
        retryable: false
      };
      break;

    case 429:
      errorResponse = {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        retryable: true
      };
      break;

    case 500:
    case 501:
    case 502:
    case 503:
      const canRetry = await retryRequest(error);
      if (canRetry && error.config) {
        throw error; // This will trigger axios to retry with the updated config
      }
      errorResponse = {
        code: 'SERVER_ERROR',
        message: 'Server error occurred. Please try again later.',
        retryable: true
      };
      break;

    default:
      errorResponse = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred.',
        details: data,
        retryable: false
      };
  }

  throw errorResponse;
};