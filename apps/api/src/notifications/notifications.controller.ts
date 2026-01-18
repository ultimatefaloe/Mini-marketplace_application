import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BulkPayload, Payload } from './dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
  ) { }

  @Post('/broadcast')
  @ApiOperation({ summary: 'Admin broadcasting message to users base on role' })
  @ApiBearerAuth()
  @ApiBody({ type: BulkPayload })
  @ApiResponse({ status: 200, description: 'Messages broadcasted successfully' })
  async broadcastToRole(@Body() dto: { to: string, subject: string, html: string }) {
    return await this.notificationService.sendEmail(dto);
  }

  @Post('/sendmail')
  @ApiBody({ type: Payload })
  async sendmail(
    @Body() data: Payload,
  ) {
    return this.notificationService.sendEmail(data)
  }
}