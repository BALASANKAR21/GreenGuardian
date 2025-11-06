import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { auth } from '@/lib/firebase';
import { sessionService } from '@/lib/session-service';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;

  private constructor(config?: ApiClientConfig) {
    this.api = axios.create({
      baseURL: config?.baseURL || env.api.baseUrl,
      timeout: config?.timeout || env.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(config?: ApiClientConfig): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor: attach token if available
    this.api.interceptors.request.use(
      async (conf: InternalAxiosRequestConfig) => {
        const token = sessionService.getAuthToken();
        if (token && conf.headers) {
          conf.headers.Authorization = `Bearer ${token}`;
        }
        return conf;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor: simple pass-through with 401 refresh attempt
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const user = auth.currentUser;
          if (user) {
            try {
              const token = await user.getIdToken(true);
              sessionService.refreshSession(token, user);
              const originalConfig = error.config as AxiosRequestConfig | undefined;
              if (originalConfig) {
                originalConfig.headers = {
                  ...originalConfig.headers,
                  Authorization: `Bearer ${token}`,
                };
                return this.api.request(originalConfig);
              }
            } catch (e) {
              sessionService.clearSession();
              window.location.href = '/login';
              return Promise.reject(e);
            }
          } else {
            sessionService.clearSession();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.api.get<T>(url, config);
      return res.data;
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.api.post<T>(url, data, config);
      return res.data;
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.api.put<T>(url, data, config);
      return res.data;
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.api.patch<T>(url, data, config);
      return res.data;
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.api.delete<T>(url, config);
      return res.data;
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  private normalizeError(error: unknown): ApiErrorResponse {
    if (axios.isAxiosError(error)) {
      const status = (error.response && error.response.status) || 'UNKNOWN';
      const data = (error.response && error.response.data) as Record<string, any> | undefined;
      return {
        code: data?.code || `HTTP_${status}`,
        message: data?.message || error.message || 'An error occurred',
        details: data?.details,
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