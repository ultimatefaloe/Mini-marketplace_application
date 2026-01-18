import { Injectable, Logger } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {}

  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse | null> {
    // ✅ Graceful guard
    if (!file || !file.buffer || !Buffer.isBuffer(file.buffer)) {
      this.logger.warn(
        `Upload skipped: file buffer not found (field: ${file?.fieldname})`,
      );
      return null; // 👈 graceful exit (no crash)
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder:
            folder ||
            this.configService.get<string>('CLOUDINARY_FOLDER') ||
            'uploads',
          resource_type: 'auto',
          transformation: [
            { width: 1920, height: 1920, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(error);
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<UploadApiResponse[]> {
    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }

    const uploads = await Promise.all(
      files.map((file) => this.uploadFile(file, folder)),
    );

    // ✅ Remove skipped/null uploads safely
    return uploads.filter(
      (result): result is UploadApiResponse => result !== null,
    );
  }

  async deleteFile(publicId: string): Promise<any> {
    if (!publicId) return null;
    return cloudinary.uploader.destroy(publicId);
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<any> {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return null;
    }
    return cloudinary.api.delete_resources(publicIds);
  }

  extractPublicId(url: string): string {
    if (!url) return '';

    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return '';

    const pathParts = parts.slice(uploadIndex + 2);
    const fileName = pathParts.join('/');

    return fileName.replace(/\.[^/.]+$/, '');
  }
}
