import { Global, Module } from '@nestjs/common';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notification.service';

@Global()
@Module({
  controllers: [ NotificationController ],
  providers: [ 
    NotificationService, 

  ],
  exports: [
    NotificationService, 
  ]
})
export class NotificationsModule {}
