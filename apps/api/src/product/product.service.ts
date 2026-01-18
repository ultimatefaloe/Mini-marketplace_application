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

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, user: JwtPayload) {
    // Validate SKUs are unique
    if (createProductDto.variants?.length) {
      const skus = createProductDto.variants.map((v) => v.sku);
      const uniqueSkus = new Set(skus);
      if (skus.length !== uniqueSkus.size) {
        throw new BadRequestException('Duplicate SKUs found in variants');
      }
    }

    const product = await this.productModel.create({
      ...createProductDto,
      createdBy: new Types.ObjectId(user.auth_id),
    });

    return this.toDetailEntity(product);
  }

  async findAll(query: QueryProductDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
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
    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
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
          '_id name description categoryId brand basePrice isActive tags viewCount soldCount createdAt updatedAt',
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data: products.map((p) => this.toListEntity(p)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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

    return this.toDetailEntity(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check ownership (only creator or SUPER_ADMIN can update)
    if (
      user.role !== 'SUPER_ADMIN' &&
      product.createdBy.toString() !== user.auth_id
    ) {
      throw new ForbiddenException('You can only update your own products');
    }

    // Validate SKUs if variants are being updated
    if (updateProductDto.variants?.length) {
      const skus = updateProductDto.variants.map((v) => v.sku);
      const uniqueSkus = new Set(skus);
      if (skus.length !== uniqueSkus.size) {
        throw new BadRequestException('Duplicate SKUs found in variants');
      }
    }

    Object.assign(product, updateProductDto);
    await product.save();

    return this.toDetailEntity(product);
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

    return { message: 'Product deleted successfully' };
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

    return { message: 'Product deactivated successfully' };
  }

  async updateStock(id: string, sku: string, quantity: number, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const variant = product.variants.find((v) => v.sku === sku);
    if (!variant) {
      throw new NotFoundException(`Variant with SKU ${sku} not found`);
    }

    variant.stock = quantity;
    await product.save();

    return { message: 'Stock updated successfully', variant };
  }

  // Helper methods
  private toListEntity(product: any): any {
    const {
      _id,
      name,
      description,
      categoryId,
      brand,
      basePrice,
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
      description,
      categoryId,
      brand,
      basePrice,
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