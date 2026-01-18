import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CloudinaryService } from '../cloudinary.service';

@Injectable()
export class CloudinaryUploadInterceptor implements NestInterceptor {
  constructor(private cloudinaryService: CloudinaryService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const files = request.files as Express.Multer.File[];

    if (files && files.length > 0) {
      try {
        // Upload all files to Cloudinary
        const uploadResults = await this.cloudinaryService.uploadMultipleFiles(files);
        
        // Add Cloudinary URLs to request
        request.cloudinaryUrls = uploadResults.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        }));
      } catch (error) {
        throw new BadRequestException('File upload failed: ' + error.message);
      }
    }

    return next.handle();
  }
}