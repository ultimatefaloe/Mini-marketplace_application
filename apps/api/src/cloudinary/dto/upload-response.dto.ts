export class UploadedFileDto {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export class UploadResponseDto {
  images: UploadedFileDto[];
  message: string;
}