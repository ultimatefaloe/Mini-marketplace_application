export class CategoryEntity {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  description?: string;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  children?: CategoryEntity[];
  parent?: CategoryEntity;
}