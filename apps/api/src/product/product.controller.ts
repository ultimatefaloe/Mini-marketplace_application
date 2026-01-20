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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto';
import { Roles, CurrentUser, Public } from '../auth/decorators';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Upload } from 'src/cloudinary/decorators/upload.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @Upload('images', 8)
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFiles() file: Express.Multer.File[]
  ) {
    const result = await this.cloudinaryService.uploadMultipleFiles(file, 'mini-marketplace/products');
    const images: string[] = result.length > 0 ? result.map(r => r.secure_url) : createProductDto.images!
    return this.productService.create(createProductDto, images, user);
  }

  @Get()
  @Public()
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

@Patch(':id')
@Roles('ADMIN', 'SUPER_ADMIN')
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
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productService.remove(id, user);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  softDelete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productService.softDelete(id, user);
  }

  @Patch(':id/stock/:sku')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productService.updateStock(id, quantity, user);
  }
}