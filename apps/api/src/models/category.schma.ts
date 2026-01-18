import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  slug: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true,
  })
  parentId: Types.ObjectId | null;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: null })
  icon: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Admin',
    index: true,
  })
  createdBy: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Compound indexes for performance
CategorySchema.index({ name: 1, isActive: 1 });
CategorySchema.index({ slug: 1, isActive: 1 });
CategorySchema.index({ parentId: 1, isActive: 1 });
CategorySchema.index({ order: 1, isActive: 1 });

// Text index for search
CategorySchema.index({ name: 'text', description: 'text' });
