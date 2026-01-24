import type { IApiErrorResponse, IApiResponse, IApiSuccessResponse } from "./api.types";
import type { ObjectId } from "./base.types";
import { OrderStatus } from "./enums";

/**
 * Check if value is a valid ObjectId string
 */
export function isObjectId(value: any): value is ObjectId {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}

/**
 * Check if response is an error
 */
export function isApiError(response: IApiResponse): response is IApiErrorResponse {
  return 'success' in response && response.success === false;
}

/**
 * Check if response is successful
 */
export function isApiSuccess<T>(response: IApiResponse<T>): response is IApiSuccessResponse<T> {
  return 'success' in response && response.success === true;
}

/**
 * Check if order can be cancelled
 */
export function isOrderCancellable(status: OrderStatus): boolean {
  return [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
  ].includes(status);
}

/**
 * Check if order is in final state
 */
export function isOrderFinal(status: OrderStatus): boolean {
  return [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
  ].includes(status);
}