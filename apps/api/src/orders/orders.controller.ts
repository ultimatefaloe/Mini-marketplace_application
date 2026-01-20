import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto, QueryOrderDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { OrderService } from './orders.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orderService.create(createOrderDto, user);
  }

  @Get()
  findAll(@Query() query: QueryOrderDto, @CurrentUser() user: JwtPayload) {
    return this.orderService.findAll(query, user);
  }

  @Get('stats')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats(@Query('userId') userId?: string) {
    return this.orderService.getOrderStats(userId);
  }

  @Get('number/:orderNumber')
  findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orderService.findByOrderNumber(orderNumber, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.orderService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orderService.updateStatus(id, updateStatusDto, user);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @Param('id') id: string,
    @Body() cancelDto: CancelOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orderService.cancel(id, cancelDto, user);
  }
}