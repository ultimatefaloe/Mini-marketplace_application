import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Category, CategoryDocument } from 'src/models/category.schma';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto, iconImage: string, user: JwtPayload) {
    // Generate slug if not provided
    const slug =
      createCategoryDto.slug ||
      this.generateSlug(createCategoryDto.name);

    if (!iconImage && !createCategoryDto.icon) throw new BadRequestException('Upload Category Icon');

    // Check if slug already exists
    const existingSlug = await this.categoryModel.findOne({ slug });
    if (existingSlug) {
      throw new ConflictException(`Slug "${slug}" already exists`);
    }

    // Check if name already exists
    const existingName = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (existingName) {
      throw new ConflictException(
        `Category "${createCategoryDto.name}" already exists`,
      );
    }

    const category = await this.categoryModel.create({
      ...createCategoryDto,
      icon: iconImage ?? createCategoryDto.icon,
      slug,
      createdBy: new Types.ObjectId(user.auth_id),
    });

    return {
      success: true,
      message: 'success',
      data: this.toEntity(category)
    }
  }

  async findAll(query: QueryCategoryDto) {
    const { search, isActive } = query;

    const filter: any = {};

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Active filter
    if (isActive !== undefined) {
      filter.isActive = isActive;
    } else {
      // Default: show only active
      filter.isActive = true;
    }

    const categories = await this.categoryModel
      .find(filter)
      .sort({ order: 1, name: 1 })
      .lean()
      .exec();

    return {
      success: true,
      message: 'success',
      data: categories.map((c) => this.toEntity(c))
    }
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel
      .findById(id)
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      success: true,
      message: 'success',
      data: {
        ...this.toEntity(category),
      }
    };
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel
      .findOne({ slug, isActive: true })
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      success: true,
      message: 'success',
      data: {
        ...this.toEntity(category),
        // children: children.map((c) => this.toEntity(c)),
      }
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check ownership (only creator or SUPER_ADMIN can update)
    if (
      user.role !== 'SUPER_ADMIN' &&
      category.createdBy?.toString() !== user.auth_id
    ) {
      throw new ForbiddenException('You can only update your own categories');
    }

    // Check slug uniqueness if being updated
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingSlug = await this.categoryModel.findOne({
        slug: updateCategoryDto.slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        throw new ConflictException(`Slug "${updateCategoryDto.slug}" already exists`);
      }
    }

    // Check name uniqueness if being updated
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingName = await this.categoryModel.findOne({
        name: updateCategoryDto.name,
        _id: { $ne: id },
      });
      if (existingName) {
        throw new ConflictException(
          `Category "${updateCategoryDto.name}" already exists`,
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    await category.save();

    return {
      success: true,
      message: "Category updated",
      data: this.toEntity(category)
    }
  }

  async remove(id: string, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check ownership
    if (
      user.role !== 'SUPER_ADMIN' &&
      category.createdBy?.toString() !== user.auth_id
    ) {
      throw new ForbiddenException('You can only delete your own categories');
    }

    // // Check if category has children
    // const hasChildren = await this.categoryModel.exists({ parentId: id });
    // if (hasChildren) {
    //   throw new BadRequestException(
    //     'Cannot delete category with auth_idcategories. Delete or reassign auth_idcategories first.',
    //   );
    // }

    // Check if category has products
    // Note: Uncomment when Product module is integrated
    // const hasProducts = await this.productModel.exists({ categoryId: id });
    // if (hasProducts) {
    //   throw new BadRequestException(
    //     'Cannot delete category with products. Reassign products first.',
    //   );
    // }

    await category.deleteOne();

    return { success: true, message: 'Category deleted successfully' };
  }

  async softDelete(id: string, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check ownership
    if (
      user.role !== 'SUPER_ADMIN' &&
      category.createdBy?.toString() !== user.auth_id
    ) {
      throw new ForbiddenException('You can only deactivate your own categories');
    }

    category.isActive = false;
    await category.save();

    // // Optionally deactivate all child categories
    // await this.categoryModel.updateMany(
    //   { parentId: id },
    //   { isActive: false },
    // );

    return { success: true, message: 'Category and its auth_idcategories deactivated successfully' };
  }

  async reorder(updates: Array<{ id: string; order: number }>) {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(update.id) },
        update: { $set: { order: update.order } },
      },
    }));

    await this.categoryModel.bulkWrite(bulkOps);

    return { success: true, message: 'Categories reordered successfully' };
  }

  // ========== HELPER METHODS ==========
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toEntity(category: any): any {
    return category;
  }
}
