/**
 * Standard API success response
 */
export interface IApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard API error response
 */
export interface IApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  statusCode: number;
}

/**
 * API response wrapper (success or error)
 */
export type IApiResponse<T = any> = IApiSuccessResponse<T> | IApiErrorResponse;
