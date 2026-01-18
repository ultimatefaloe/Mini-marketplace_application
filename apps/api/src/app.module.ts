import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { InjectConnection } from '@nestjs/mongoose'; // Import the InjectConnection decorator
import { Connection } from 'mongoose'; // Import the Connection type
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    DatabaseModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    CloudinaryModule,
    UploadModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  // Inject the connection using InjectConnection decorator
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    // Listen to mongoose connection events
    this.connection.on('connected', () => {
      this.logger.log(`Successfully connected to the database`);
    });

    this.connection.on('error', (err) => {
      this.logger.error(`Error connecting to the database: ${err}`);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('Database connection disconnected');
    });
  }
}
