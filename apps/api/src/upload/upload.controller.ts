import {
  Controller,
  Post,
  UploadedFiles,
  BadRequestException,
  UseInterceptors,
  Body,
  Delete,
} from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Upload, UploadSingle } from 'src/cloudinary/decorators/upload.decorator';

@Controller('upload')
export class UploadController {
  constructor(private cloudinaryService: CloudinaryService) { }

  @Post('single')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UploadSingle('image')
  async uploadSingle(@UploadedFiles() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.cloudinaryService.uploadFile(file);
    if (!result) throw new BadRequestException('Invalid result return')
    return {
      url: result.secure_url,
      publicId: result?.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  @Post('multiple')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Upload('images', 8)
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await this.cloudinaryService.uploadMultipleFiles(files);

    return {
      images: results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      })),
      message: `${files.length} files uploaded successfully`,
    };
  }

  @Post('product')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Upload('images', 8)
  async uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await this.cloudinaryService.uploadMultipleFiles(
      files,
      'products',
    );

    return {
      images: results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      })),
      message: `${files.length} product images uploaded successfully`,
    };
  }

  @Post('category')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UploadSingle('icon')
  async uploadCategoryIcon(@UploadedFiles() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.cloudinaryService.uploadFile(file, 'categories');
    if (!result) throw new BadRequestException('Invalid result return')

    return {
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Category icon uploaded successfully',
    };
  }

  @Delete('single')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async deleteFile(@Body('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    await this.cloudinaryService.deleteFile(publicId);

    return {
      message: 'File deleted successfully',
    };
  }

  @Delete('multiple')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async deleteMultipleFiles(@Body('publicIds') publicIds: string[]) {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('Public IDs are required');
    }

    await this.cloudinaryService.deleteMultipleFiles(publicIds);

    return {
      message: `${publicIds.length} files deleted successfully`,
    };
  }

  @Delete('by-url')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async deleteFileByUrl(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    const publicId = this.cloudinaryService.extractPublicId(url);
    if (!publicId) {
      throw new BadRequestException('Invalid Cloudinary URL');
    }

    await this.cloudinaryService.deleteFile(publicId);

    return {
      message: 'File deleted successfully',
    };
  }
}
