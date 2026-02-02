import type { IBaseDocument, ITimestamps } from "./base.types";
import type { UserRole } from "./enums";

export interface IVendorPermissions {
  manageProducts: boolean;
  manageOrders: boolean;
  managePayments: boolean;
}

/**
 * Admin base interface (excluding sensitive fields)
 */
export interface IVendor extends IBaseDocument, ITimestamps {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  permissions?: IVendorPermissions;
  isActive: boolean;
  googleId?: string | null;
}

/**
 * Admin with password (for backend use only)
 */
export interface IVendorWithPassword extends IVendor {
  passwordHash: string;
  refreshToken?: string | null;
}

/**
 * Admin creation payload
 */
export interface ICreateVendorPayload {
  email: string;
  phone: string;
  businessName: string;
  description?: string;
  // businessLogo?: (this is will be an uploaded file)
  // idDocument?: (this is will be an uploaded file)
  password: string;
  location: IVendorAddress
}

export interface IVendorAddress {
  street: string;
  city: string;
  state: string;
  country: string;
}

/**
 * Admin update payload
 */
export interface IUpdateVendorPayload {
  fullName?: string;
  phone?: string;
  permissions?: Partial<IVendorPermissions>;
  isActive?: boolean;
}

/**
 * Admin login response
 */
export interface IVendorAuthResponse {
  message: string;
}