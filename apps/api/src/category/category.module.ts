import { Module, LoggerService, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category, CategorySchema } from 'src/models/category.schma';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema}]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, Logger, CloudinaryService],
  exports: [CategoryService],
})
export class CategoryModule {}