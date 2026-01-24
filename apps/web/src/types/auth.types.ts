import type { ObjectId } from "./base.types";
import type { UserRole } from "./enums";

/**
 * JWT payload structure
 */
export interface IJwtPayload {
  sub: ObjectId;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Login credentials
 */
export interface ILoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup credentials
 */
export interface ISignupCredentials {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

/**
 * Google OAuth user
 */
export interface IGoogleOAuthUser {
  googleId: string;
  email: string;
  fullName?: string;
}

/**
 * Password reset request
 */
export interface IPasswordResetRequest {
  email: string;
}

/**
 * Password reset payload
 */
export interface IPasswordResetPayload {
  token: string;
  newPassword: string;
}

/**
 * Token validation response
 */
export interface ITokenValidationResponse {
  valid: boolean;
  user: {
    auth_Id: ObjectId;
    email: string;
    role: UserRole;
  };
}