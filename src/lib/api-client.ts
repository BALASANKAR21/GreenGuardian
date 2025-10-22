import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios';
import { env } from '@/config/env';
import { auth } from '@/lib/firebase';
import { sessionService } from '@/lib/session-service';
import { 
  RequestTransform, 
  ResponseTransform,
  ErrorTransform,
  ApiErrorData,
  addDefaultHeaders,
  addAuthToken,
  transformResponse,
  handleApiError 
} from './api-transforms';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  requestTransforms?: RequestTransform[];
  responseTransforms?: ResponseTransform[];
  errorTransforms?: ErrorTransform[];
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;
  private requestTransforms: RequestTransform[];
  private responseTransforms: ResponseTransform[];
  private errorTransforms: ErrorTransform[];

  private constructor(config?: ApiClientConfig) {
    // Initialize axios instance
    this.api = axios.create({
      baseURL: config?.baseURL || env.api.baseUrl,
      timeout: config?.timeout || env.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Set up transforms
    this.requestTransforms = [
      addDefaultHeaders,
      addAuthToken,
      ...(config?.requestTransforms || []),
    ];
    this.responseTransforms = [
      transformResponse,
      ...(config?.responseTransforms || []),
    ];
    this.errorTransforms = [
      handleApiError,
      ...(config?.errorTransforms || []),
    ];

    this.setupInterceptors();
  }

  public static getInstance(config?: ApiClientConfig): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Apply all request transforms
        let transformedConfig = config;
        for (const transform of this.requestTransforms) {
          transformedConfig = await transform(transformedConfig);
        }

        // Check if authentication is needed
        if (!config.headers.Authorization) {
          const token = sessionService.getAuthToken();
          if (token) {
            transformedConfig.headers.Authorization = `Bearer ${token}`;
          }
        }

        return transformedConfig;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      async (response: AxiosResponse) => {
        // Apply all response transforms
        let transformedResponse = response;
        for (const transform of this.responseTransforms) {
          transformedResponse = await transform(transformedResponse);
        }
        return transformedResponse;
      },
      async (error: AxiosError) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          const user = auth.currentUser;
          if (user) {
            try {
              // Get fresh token
              const token = await user.getIdToken(true);
              // Update session
              sessionService.refreshSession(token, user);
              
              // Retry the original request with new token
              const config = error.config as AxiosRequestConfig;
              if (config) {
                config.headers = {
                  ...config.headers,
                  Authorization: `Bearer ${token}`,
                };
                return this.api.request(config);
              }
            } catch (refreshError) {
              // Token refresh failed, clear session and redirect to login
              sessionService.clearSession();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          } else {
            // No user, clear session and redirect to login
            sessionService.clearSession();
            window.location.href = '/login';
          }
        }

        // Apply error transforms
        let transformedError = error as AxiosError<ApiErrorData>;
        for (const transform of this.errorTransforms) {
          try {
            return await transform(transformedError);
          } catch (e) {
            if (e instanceof AxiosError) {
              transformedError = e as AxiosError<ApiErrorData>;
            } else {
              throw this.normalizeError(e);
            }
          }
        }
        throw this.normalizeError(transformedError);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  public async post<T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  public async put<T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  public async patch<T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Upload file with progress tracking
  public async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.api.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded * 100) / progressEvent.total;
            onProgress(Math.round(progress));
          }
        },
      });
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Download file with progress tracking
  public async downloadFile(
    url: string,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    try {
      const response = await this.api.get(url, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded * 100) / progressEvent.total;
            onProgress(Math.round(progress));
          }
        },
      });

      // Trigger file download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Batch requests
  public async batch<T>(requests: AxiosRequestConfig[]): Promise<T[]> {
    try {
      const responses = await Promise.all(
        requests.map(config => this.api.request(config))
      );
      return responses.map(response => response.data);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Retry a failed request
  public async retry<T>(
    request: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await request();
      } catch (error) {
        lastError = error;
        
        if (error instanceof AxiosError && error.response) {
          // Don't retry if it's a client error (4xx)
          if (error.response.status >= 400 && error.response.status < 500) {
            throw this.normalizeError(error);
          }
        }
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          // Exponential backoff
          delay *= 2;
        }
      }
    }
    
    throw this.normalizeError(lastError);
  }

  private normalizeError(error: unknown): ApiErrorResponse {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data as Record<string, any>;

      return {
        code: data?.code || `HTTP_${status}`,
        message: data?.message || error.message || 'An error occurred',
        details: data?.details || undefined,
      };
    }

    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };
  }
}