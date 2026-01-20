import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
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
    private readonly logger: Logger
  ) {}

  async create(createCategoryDto: CreateCategoryDto, iconImage: string,  user: JwtPayload) {
    // Generate slug if not provided
    const slug =
      createCategoryDto.slug ||
      this.generateSlug(createCategoryDto.name);

    if(!iconImage && !createCategoryDto.icon) throw new BadRequestException('Upload Category Icon');

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

    // Validate parent category exists
    if (createCategoryDto.parentId) {
      const parent = await this.categoryModel.findById(
        createCategoryDto.parentId,
      );
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
      if (!parent.isActive) {
        throw new BadRequestException('Parent category is not active');
      }
    }

    const category = await this.categoryModel.create({
      ...createCategoryDto,
      icon: iconImage ?? createCategoryDto.icon,
      slug,
      createdBy: new Types.ObjectId(user.auth_id),
    });

    return this.toEntity(category);
  }

  async findAll(query: QueryCategoryDto) {
    const { search, parentId, isActive, includeChildren } = query;

    const filter: any = {};

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Parent filter
    if (parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        // Get root categories (no parent)
        filter.parentId = null;
      } else {
        filter.parentId = new Types.ObjectId(parentId);
      }
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
      .populate('parentId', 'name slug')
      .sort({ order: 1, name: 1 })
      .lean()
      .exec();

    // Include children if requested
    if (includeChildren) {
      return this.buildCategoryTree(categories);
    }

    return categories.map((c) => this.toEntity(c));
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel
      .findById(id)
      .populate('parentId', 'name slug icon')
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Get children
    const children = await this.categoryModel
      .find({ parentId: category._id, isActive: true })
      .sort({ order: 1, name: 1 })
      .lean()
      .exec();

    return {
      ...this.toEntity(category),
      children: children.map((c) => this.toEntity(c)),
    };
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel
      .findOne({ slug, isActive: true })
      .populate('parentId', 'name slug icon')
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Get children
    const children = await this.categoryModel
      .find({ parentId: category._id, isActive: true })
      .sort({ order: 1, name: 1 })
      .lean()
      .exec();

    return {
      ...this.toEntity(category),
      children: children.map((c) => this.toEntity(c)),
    };
  }

  async getTree() {
    // Get all active categories
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean()
      .exec();

    return this.buildTree(categories, null);
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

    // Validate parent change (prevent circular reference)
    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.categoryModel.findById(updateCategoryDto.parentId);
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }

      // Check if new parent is a descendant of current category
      const isDescendant = await this.isDescendant(
        id,
        updateCategoryDto.parentId,
      );
      if (isDescendant) {
        throw new BadRequestException(
          'Cannot set a descendant category as parent (circular reference)',
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    await category.save();

    return this.toEntity(category);
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

    // Check if category has children
    const hasChildren = await this.categoryModel.exists({ parentId: id });
    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete category with auth_idcategories. Delete or reassign auth_idcategories first.',
      );
    }

    // Check if category has products
    // Note: Uncomment when Product module is integrated
    // const hasProducts = await this.productModel.exists({ categoryId: id });
    // if (hasProducts) {
    //   throw new BadRequestException(
    //     'Cannot delete category with products. Reassign products first.',
    //   );
    // }

    await category.deleteOne();

    return { message: 'Category deleted successfully' };
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

    // Optionally deactivate all child categories
    await this.categoryModel.updateMany(
      { parentId: id },
      { isActive: false },
    );

    return { message: 'Category and its auth_idcategories deactivated successfully' };
  }

  async reorder(updates: Array<{ id: string; order: number }>) {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(update.id) },
        update: { $set: { order: update.order } },
      },
    }));

    await this.categoryModel.bulkWrite(bulkOps);

    return { message: 'Categories reordered successfully' };
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

  private async isDescendant(
    ancestorId: string,
    descendantId: string,
  ): Promise<boolean> {
    const descendant = await this.categoryModel.findById(descendantId);
    if (!descendant || !descendant.parentId) {
      return false;
    }

    if (descendant.parentId.toString() === ancestorId) {
      return true;
    }

    return this.isDescendant(ancestorId, descendant.parentId.toString());
  }

  private buildTree(categories: any[], parentId: Types.ObjectId | null): any[] {
    const tree: any[] = [];

    for (const category of categories) {
      const catParentId = category.parentId?.toString() || null;
      const checkParentId = parentId?.toString() || null;

      if (catParentId === checkParentId) {
        const children = this.buildTree(categories, category._id);
        tree.push({
          _id: category._id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          order: category.order,
          children,
        });
      }
    }

    return tree.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }

  private buildCategoryTree(categories: any[]): any[] {
    const categoryMap = new Map();
    const roots: any[] = [];

    // Create a map of all categories
    categories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), {
        ...this.toEntity(cat),
        children: [],
      });
    });

    // Build the tree
    categories.forEach((cat) => {
      const category = categoryMap.get(cat._id.toString());
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId.toString());
        if (parent) {
          parent.children.push(category);
        } else {
          roots.push(category);
        }
      } else {
        roots.push(category);
      }
    });

    return roots;
  }

  private toEntity(category: any): any {
    return category;
  }
}
