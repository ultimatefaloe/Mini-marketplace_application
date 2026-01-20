import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto, UpdateCartItemDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/auth/decorators';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(
    private readonly cartService: CartsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async addToCart(
    @Body() createCartDto: CreateCartDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.cartService.addToCart(createCartDto, user);
  }

  @Get()
  async getCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.getCart(user);
  }

  @Patch(':productId')
  async updateCartItem(
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.cartService.updateCartItem(productId, updateCartItemDto, user);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  async removeFromCart(
    @Param('productId') productId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.cartService.removeFromCart(productId, user);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.clearCart(user);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.syncCartPrices(user);
  }
}