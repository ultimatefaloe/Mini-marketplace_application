import type { IApiResponse, IApiErrorResponse } from '@/types';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Type guard for API error responses
 */
function isApiErrorResponse(data: any): data is IApiErrorResponse {
  return data && 'error' in data;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Core request method with proper IApiResponse handling
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<IApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      const data: IApiResponse<T> = await response.json();

      // Check if response is an error response
      if (isApiErrorResponse(data)) {
        throw new ApiError(
          data.statusCode,
          data.error.code,
          data.error.message,
          data.error.details
        );
      }

      // Check HTTP status even if JSON parsing succeeded
      if (!response.ok) {
        throw new ApiError(
          response.status,
          'HTTP_ERROR',
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error.message;
      }

      // Handle network errors or JSON parsing errors
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  }

  /**
   * Unwrap IApiResponse to get just the data
   * Use this for simpler API calls where you just want the data
   */
  private async unwrap<T>(promise: Promise<IApiResponse<T>>): Promise<T> {
    const response = await promise;
    if (!response.success) {
      throw new Error('Unexpected error response');
    }
    return response.data;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Convenience methods that unwrap responses
   * Use these when you just want the data and will handle errors at a higher level
   */
  async getData<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.unwrap(this.get<T>(endpoint, options));
  }

  async postData<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.unwrap(this.post<T>(endpoint, body, options));
  }

  async patchData<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.unwrap(this.patch<T>(endpoint, body, options));
  }

  async deleteData<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.unwrap(this.delete<T>(endpoint, options));
  }
}

export const apiClient = new ApiClient();