import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class VariantOptions {
  @Prop({ type: [String], default: [] })
  sizes: string[];

  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop({ type: [String], default: [] })
  materials: string[];

  @Prop({ type: [String], default: [] })
  genders: string[];
}

export const VariantOptionsSchema = SchemaFactory.createForClass(VariantOptions);


@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, index: 'text' })
  name: string;

  @Prop({ required: true, trim: true, index: 'text' })
  slug: string;

  @Prop({ trim: true })
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  })
  categoryId: Types.ObjectId;

  @Prop({ trim: true, index: true })
  brand: string;

  @Prop({ type: VariantOptionsSchema, default: {} })
  variantOptions: VariantOptions;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ min: 0, max: 100 })
  discount: number;

  @Prop({ required: true, min: 0 })
  price: number; // kobo

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Admin',
    index: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  soldCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Compound indexes for performance
ProductSchema.index({ name: 1, isActive: 1 });
ProductSchema.index({ categoryId: 1, isActive: 1 });
ProductSchema.index({ brand: 1, isActive: 1 });
ProductSchema.index({ tags: 1, isActive: 1 });
ProductSchema.index({ createdAt: -1 });

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
