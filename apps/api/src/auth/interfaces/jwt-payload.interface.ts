import { AppRole } from "src/type";

export interface JwtPayload {
  auth_id: string;
  email: string;
  role: AppRole;
  
  // User specific
  fullName?: string;
  phone?: string;
  isActive?: boolean;
  
  // Vendor specific
  businessName?: string;
  verified?: boolean;
  accountStatus?: string;
  location?: {
    lat: number;
    lng: number;
    city?: string;
    state?: string;
  };
}