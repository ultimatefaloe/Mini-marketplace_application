import type { IBaseDocument, IBaseUser, ITimestamps } from "./base.types";
import type { UserRole } from "./enums";

export interface IUser extends IBaseDocument, ITimestamps, IBaseUser {
  fullName: string;
  phone?: string;
  role: UserRole.USER;
  isActive: boolean;
  googleId?: string | null;
}

/**
 * User with password (for backend use only)
 */
export interface IUserWithPassword extends IUser {
  passwordHash: string;
  refreshToken?: string | null;
}

/**
 * User creation payload
 */
export interface ICreateUserPayload {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

/**
 * User update payload
 */
export interface IUpdateUserPayload {
  fullName?: string;
  phone?: string;
}

/**
 * User login response
 */
export interface IUserAuthResponse {
  success: boolean;
  message: string;
  data: IUser
}