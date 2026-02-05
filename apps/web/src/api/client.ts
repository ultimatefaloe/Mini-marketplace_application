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


const isFileLike = (value: any) =>
  value instanceof File || value instanceof Blob;

const shouldUseFormData = (obj: any) =>
  Object.values(obj).some(
    v =>
      isFileLike(v) ||
      (Array.isArray(v) && v.some(isFileLike))
  );


class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Prepare request body and headers based on content type
   */
  private prepareRequestBody(
    body: any
  ): { body: BodyInit | undefined; headers: HeadersInit } {
    const headers: HeadersInit = {};

    // 1️⃣ Already FormData → pass through
    if (body instanceof FormData) {
      return { body, headers };
    }

    // 2️⃣ Blob / File
    if (body instanceof Blob) {
      headers["Content-Type"] =
        body.type || "application/octet-stream";
      return { body, headers };
    }

    // 3️⃣ URLSearchParams
    if (body instanceof URLSearchParams) {
      headers["Content-Type"] =
        "application/x-www-form-urlencoded";
      return { body, headers };
    }

    // 4️⃣ Object with files → convert to FormData
    if (
      body &&
      typeof body === "object" &&
      shouldUseFormData(body)
    ) {
      const formData = new FormData();

      Object.entries(body).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // Handle arrays
        if (Array.isArray(value)) {
          value.forEach(v => {
            if (isFileLike(v)) {
              formData.append(key, v);
            } else {
              formData.append(key, String(v));
            }
          });
          return;
        }

        // Handle single file
        if (isFileLike(value)) {
          formData.append(key, value);
          return;
        }

        // Handle objects
        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
          return;
        }

        // Handle primitives
        formData.append(key, String(value));
      });


      return { body: formData, headers };
    }

    // 5️⃣ Plain object / array → JSON
    if (body !== null && body !== undefined && typeof body === "object") {
      headers["Content-Type"] = "application/json";
      return { body: JSON.stringify(body), headers };
    }

    // 6️⃣ String
    if (typeof body === "string") {
      headers["Content-Type"] = "application/json";
      return { body, headers };
    }

    // 7️⃣ No body
    return { body: undefined, headers };
  }


  /**
   * Core request method with proper IApiResponse handling
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<IApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Prepare body and content-type headers
    const { body: preparedBody, headers: bodyHeaders } = options.body
      ? this.prepareRequestBody(options.body)
      : { body: undefined, headers: {} };

    const config: RequestInit = {
      ...options,
      body: preparedBody,
      headers: {
        ...bodyHeaders,
        ...options.headers, // User headers override auto-detected ones
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);

      // Handle empty responses (204 No Content, etc.)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {
          success: true,
          data: {} as T,
        } as IApiResponse<T>;
      }

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      let data: IApiResponse<T>;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (text, blob, etc.)
        const text = await response.text();
        data = {
          success: response.ok,
          data: text as any,
        } as IApiResponse<T>;
      }

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
        throw error;
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

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request - supports JSON, FormData, Blob, URLSearchParams
   */
  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  }

  /**
   * PATCH request - supports JSON, FormData, Blob, URLSearchParams
   */
  async patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  }

  /**
   * PUT request - supports JSON, FormData, Blob, URLSearchParams
   */
  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  /**
   * DELETE request
   */
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

  async putData<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.unwrap(this.put<T>(endpoint, body, options));
  }

  async deleteData<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.unwrap(this.delete<T>(endpoint, options));
  }

  /**
   * Specialized method for file uploads with progress tracking (optional)
   */
  async uploadFile<T>(
    endpoint: string,
    file: File | Blob,
    fieldName: string = 'file',
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<IApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    // Append additional data to FormData
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }

    // If progress tracking is needed, use XMLHttpRequest
    if (onProgress) {
      return this.uploadWithProgress<T>(endpoint, formData, onProgress);
    }

    return this.post<T>(endpoint, formData);
  }

  /**
   * Upload with progress tracking using XMLHttpRequest
   */
  private uploadWithProgress<T>(
    endpoint: string,
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<IApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${this.baseURL}${endpoint}`;

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: IApiResponse<T> = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new ApiError(xhr.status, 'PARSE_ERROR', 'Failed to parse response'));
          }
        } else {
          try {
            const errorResponse: IApiErrorResponse = JSON.parse(xhr.responseText);
            reject(
              new ApiError(
                errorResponse.statusCode,
                errorResponse.error.code,
                errorResponse.error.message,
                errorResponse.error.details
              )
            );
          } catch {
            reject(new ApiError(xhr.status, 'HTTP_ERROR', `HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError(0, 'NETWORK_ERROR', 'Network request failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new ApiError(0, 'ABORTED', 'Request aborted'));
      });

      xhr.open('POST', url);
      xhr.withCredentials = true; // For cookies
      xhr.send(formData);
    });
  }
}

export const apiClient = new ApiClient();