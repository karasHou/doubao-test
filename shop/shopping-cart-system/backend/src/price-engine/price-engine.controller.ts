import { Controller, Get, Post, Body } from '@nestjs/common';
import { PriceEngineService, CartItem, PriceCalculationResult, PromotionRule } from './price-engine.service';

@Controller('price-engine')
export class PriceEngineController {
  constructor(private readonly priceEngineService: PriceEngineService) {}

  /**
   * 计算价格
   */
  @Post('calculate')
  calculatePrice(@Body() body: { cartItems: CartItem[]; coupons?: string[] }): PriceCalculationResult {
    return this.priceEngineService.calculatePrice(body.cartItems, body.coupons || []);
  }

  /**
   * 获取所有促销规则
   */
  @Get('promotions')
  getAllPromotions(): PromotionRule[] {
    return this.priceEngineService.getAllPromotions();
  }

  /**
   * 获取优惠券列表
   */
  @Get('coupons')
  getCoupons(): PromotionRule[] {
    return this.priceEngineService.getCoupons();
  }
}
