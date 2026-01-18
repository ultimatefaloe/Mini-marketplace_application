export class ProductDetailEntity {
  _id: string;
  name: string;
  description: string;
  categoryId: string;
  brand: string;
  variantOptions: any;
  variants: any[];
  tags: string[];
  basePrice: number;
  isActive: boolean;
  createdBy: string;
  viewCount: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}