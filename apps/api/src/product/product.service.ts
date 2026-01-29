import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Product, ProductDocument } from 'src/models/product.shcema';
import slugify from 'slugify';
import { Category, CategoryDocument } from 'src/models/category.schma';


@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
  ) { }

  async create(
    createProductDto: CreateProductDto,
    images: string[] = [],
    user: JwtPayload,
  ) {
    // Generate base slug
    const baseSlug = slugify(createProductDto.name, {
      lower: true,
      strict: true, // removes special characters
      trim: true,
    });

    // Ensure slug uniqueness
    let slug = baseSlug;
    let count = 1;

    while (await this.productModel.exists({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const product = await this.productModel.create({
      ...createProductDto,
      images,
      slug,
      createdBy: new Types.ObjectId(user.auth_id),
    });

    return {
      success: true,
      message: 'success',
      data: this.toDetailEntity(product)
    }
  }


  async findAll(query: QueryProductDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categorySlug,
      brand,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      isActive,
    } = query;

    const filter: any = {};

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    if (categorySlug) {
      const category = await this.categoryModel.findOne({ slug: categorySlug })
      if (category) {
        filter.categoryId = category._id.toString()
      }
    }

    // Brand filter
    if (brand) {
      filter.brand = new RegExp(brand, 'i');
    }

    // Tags filter (OR)
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      filter.tags = { $in: tagArray };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.basePrice = {};
      if (minPrice !== undefined) filter.basePrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.basePrice.$lte = maxPrice;
    }

    // Active filter (only if explicitly set)
    if (isActive !== undefined) {
      filter.isActive = isActive;
    } else {
      // Default: show only active products for public queries
      filter.isActive = true;
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .select(
          '_id name description slug categoryId brand price discount stock images isActive tags viewCount soldCount createdAt updatedAt',
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      success: true,
      message: 'success',
      data: {
        data: products.map((p) => this.toListEntity(p)),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      }
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel
      .findById(id)
      .populate('categoryId', 'name')
      .lean()
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count (fire and forget)
    this.productModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } })
      .exec()
      .catch((err) => console.error('View count update error:', err));

    return {
      success: true,
      message: 'success',
      data: this.toDetailEntity(product)
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    uploadedImages: string[],
    user: JwtPayload,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Ownership check
    if (
      user.role !== 'SUPER_ADMIN' &&
      product.createdBy.toString() !== user.auth_id
    ) {
      throw new ForbiddenException('You can only update your own products');
    }

    /**
     * IMAGE UPDATE LOGIC
     */
    const dtoImages = updateProductDto.images ?? [];

    if (uploadedImages.length || dtoImages.length) {
      product.images = [...dtoImages, ...uploadedImages];
    }
    // else → do nothing (keep existing images)

    /**
     * Update other fields EXCEPT images
     */
    const { images, ...rest } = updateProductDto;
    Object.assign(product, rest);

    await product.save();

    return {
      success: true,
      message: 'success',
      data: this.toDetailEntity(product)
    };
  }


  async remove(id: string, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check ownership (only creator or SUPER_ADMIN can delete)
    if (
      user.role !== 'SUPER_ADMIN' &&
      product.createdBy.toString() !== user.auth_id
    ) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await product.deleteOne();

    return { success: true, message: 'Product deleted successfully' };
  }

  async softDelete(id: string, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check ownership
    if (
      user.role !== 'SUPER_ADMIN' &&
      product.createdBy.toString() !== user.auth_id
    ) {
      throw new ForbiddenException('You can only deactivate your own products');
    }

    product.isActive = false;
    await product.save();

    return { success: true, message: 'Product deactivated successfully' };
  }

  async updateStock(id: string, quantity: number, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.stock = quantity;
    await product.save();

    return { success: true, message: 'Stock updated successfully', data: product };
  }

  // Helper methods
  private toListEntity(product: any): any {
    const {
      _id,
      name,
      slug,
      description,
      categoryId,
      brand,
      price,
      discount,
      stock,
      images,
      isActive,
      tags,
      viewCount,
      soldCount,
      createdAt,
      updatedAt,
    } = product;

    return {
      _id,
      name,
      slug,
      description,
      categoryId,
      brand,
      price,
      discount,
      stock,
      images,
      isActive,
      tags,
      viewCount,
      soldCount,
      createdAt,
      updatedAt,
    };
  }

  private toDetailEntity(product: any): any {
    return product;
  }
}