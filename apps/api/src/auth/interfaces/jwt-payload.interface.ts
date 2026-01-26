
export interface JwtPayload {
  auth_id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}