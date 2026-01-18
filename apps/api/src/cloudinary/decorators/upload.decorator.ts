import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

// File upload configuration
const multerOptions: MulterOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, callback) => {
    // Allow only images
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(
        new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'),
        false,
      );
    }
    callback(null, true);
  },
};

export function Upload(fieldName: string, maxCount: number = 8) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, multerOptions),
    ),
  );
}

export function UploadSingle(fieldName: string) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, multerOptions),
    ),
  );
}