import type { IBaseDocument, IBaseUser, ITimestamps } from "./base.types";
import type { UserRole } from "./enums";


export interface ILocation {
  street: string;
  city: string;
  state: string;
  country: string;
  lat?: string;
  lng?: string;
}

/**
 * Admin base interface (excluding sensitive fields)
 */
export interface IVendor extends IBaseDocument, ITimestamps, IBaseUser {
  fullName: string;
  businessName: string;
  description?: string;
  businessLogo?: string
  phone: string;
  role: UserRole.VENDOR;
  isActive: boolean;
  googleId?: string | null;
  location: ILocation
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
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  description?: string;
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

}

/**
 * Admin login response
 */
export interface IVendorAuthResponse {
  success: boolean;
  message: string;
  data: IVendor
}