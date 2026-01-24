import type { IBaseDocument, ITimestamps } from "./base.types";
import type { UserRole } from "./enums";

export interface IAdminPermissions {
  manageProducts: boolean;
  manageOrders: boolean;
  managePayments: boolean;
}

/**
 * Admin base interface (excluding sensitive fields)
 */
export interface IAdmin extends IBaseDocument, ITimestamps {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  permissions: IAdminPermissions;
  isActive: boolean;
  googleId?: string | null;
}

/**
 * Admin with password (for backend use only)
 */
export interface IAdminWithPassword extends IAdmin {
  passwordHash: string;
  refreshToken?: string | null;
}

/**
 * Admin creation payload
 */
export interface ICreateAdminPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  permissions?: Partial<IAdminPermissions>;
}

/**
 * Admin update payload
 */
export interface IUpdateAdminPayload {
  fullName?: string;
  phone?: string;
  permissions?: Partial<IAdminPermissions>;
  isActive?: boolean;
}

/**
 * Admin login response
 */
export interface IAdminAuthResponse {
  admin: IAdmin;
  accessToken: string;
  refreshToken: string;
}