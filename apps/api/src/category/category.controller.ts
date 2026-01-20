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
  Req,
  UploadedFile,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UploadSingle } from 'src/cloudinary/decorators/upload.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService,
    private readonly cloudinaryService: CloudinaryService) { }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UploadSingle('icon')
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File
  ) {
    const result = await this.cloudinaryService.uploadFile(file, 'mini-marketplace/categories');
    const image: string = result ? result?.secure_url : createCategoryDto.icon!
    return this.categoryService.create(createCategoryDto, image, user);
  }

  @Get()
  @Public()
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @Get('tree')
  @Public()
  getTree() {
    return this.categoryService.getTree();
  }

  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.categoryService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.categoryService.remove(id, user);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  softDelete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.categoryService.softDelete(id, user);
  }

  @Post('reorder')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  reorder(@Body() updates: Array<{ id: string; order: number }>) {
    return this.categoryService.reorder(updates);
  }
}