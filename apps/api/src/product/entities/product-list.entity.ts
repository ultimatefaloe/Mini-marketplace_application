export class ProductListEntity {
  _id: string;
  name: string;
  description: string;
  categoryId: string;
  brand: string;
  basePrice: number;
  isActive: boolean;
  tags: string[];
  viewCount: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Exclude: variants, variantOptions, createdBy for list view
}