
export interface JwtPayload {
  id: string;
  auth_id: string;
  email: string;
  role: string;
  isActive: boolean;
}