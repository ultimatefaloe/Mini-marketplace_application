
export interface JwtPayload {
  auth_id: string;
  email: string;
  role: string;
  isActive: boolean;
}