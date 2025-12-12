import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CartService, CartItem } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * 获取购物车
   */
  @Get()
  getCart(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }
    return this.cartService.getCart(userId);
  }

  /**
   * 添加商品到购物车
   */
  @Post('items')
  addItem(@Body() body: { userId: string; skuId: string; quantity?: number }) {
    if (!body.userId || !body.skuId) {
      throw new HttpException('userId and skuId are required', HttpStatus.BAD_REQUEST);
    }

    try {
      return this.cartService.addItem(body.userId, body.skuId, body.quantity || 1);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 更新购物车项目数量
   */
  @Put('items/:itemId')
  updateItemQuantity(
    @Param('itemId') itemId: string,
    @Body() body: { userId: string; quantity: number },
  ) {
    if (!body.userId || body.quantity === undefined) {
      throw new HttpException('userId and quantity are required', HttpStatus.BAD_REQUEST);
    }

    try {
      return this.cartService.updateItemQuantity(body.userId, itemId, body.quantity);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 移除购物车项目
   */
  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return this.cartService.removeItem(userId, itemId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 清空购物车
   */
  @Delete()
  clearCart(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }

    return this.cartService.clearCart(userId);
  }

  /**
   * 应用优惠券
   */
  @Post('coupons')
  applyCoupon(@Body() body: { userId: string; couponId: string }) {
    if (!body.userId || !body.couponId) {
      throw new HttpException('userId and couponId are required', HttpStatus.BAD_REQUEST);
    }

    try {
      return this.cartService.applyCoupon(body.userId, body.couponId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 移除优惠券
   */
  @Delete('coupons/:couponId')
  removeCoupon(@Param('couponId') couponId: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return this.cartService.removeCoupon(userId, couponId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 获取购物车统计信息
   */
  @Get('statistics')
  getCartStatistics(@Query('userId') userId: string) {
    if (!userId) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }

    return this.cartService.getCartStatistics(userId);
  }
}
