import type { IBaseDocument, IBaseUser, ITimestamps } from "./base.types";
import { UserRole } from "./enums";

export interface IAdminPermissions {
  manageProducts: boolean;
  manageOrders: boolean;
  managePayments: boolean;
}

/**
 * Admin base interface (excluding sensitive fields)
 */
export interface IAdmin extends IBaseDocument, ITimestamps, IBaseUser {
  fullName: string;
  phone: string;
  role: UserRole.ADMIN | UserRole.SUPER_ADMIN;
  permissions?: IAdminPermissions;
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
  success: boolean;
  message: string;
  data: IAdmin
}