import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto';
import { Roles, CurrentUser, Public } from '../auth/decorators';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Upload } from 'src/cloudinary/decorators/upload.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { RolesGuard } from 'src/auth/guards';
import { AppRole } from 'src/type';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Upload('images', 8)
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploads = await this.cloudinaryService.uploadMultipleFiles(
      files,
      'mini-marketplace/products',
    );

    const images = uploads.length
      ? uploads.map(u => u.secure_url)
      : dto.images!;

    return this.productService.create(dto, images, user);
  }



  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Upload('images', 8)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploads = await this.cloudinaryService.uploadMultipleFiles(
      files,
      'mini-marketplace/products',
    );

    const uploadedImages = uploads.map((r) => r.secure_url);

    return this.productService.update(
      id,
      updateProductDto,
      uploadedImages,
      user,
    );
  }


  @Delete(':id')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productService.remove(id, user);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  softDelete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productService.softDelete(id, user);
  }

  @Patch(':id/stock/:sku')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productService.updateStock(id, quantity, user);
  }
}