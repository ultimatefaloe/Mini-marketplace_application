import type { IBaseDocument, ITimestamps } from "./base.types";

export interface IAddress extends IBaseDocument, ITimestamps {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isDefault: boolean
}

export interface IUpdateAddress extends IBaseDocument, ITimestamps {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface ICreateAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isDefault: boolean
}

export interface IShippingResponse {
  addressId: string;
  vendors: any;
  totalDeliveryFee: any;
  currency: string;
}