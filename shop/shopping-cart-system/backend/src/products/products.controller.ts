import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { ProductsService, Product, Sku, SkuAttribute } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 获取所有商品
   */
  @Get()
  getAllProducts(): Product[] {
    return this.productsService.getAllProducts();
  }

  /**
   * 获取商品详情
   */
  @Get(':id')
  getProductById(@Param('id') id: string): Product | undefined {
    return this.productsService.getProductById(id);
  }

  /**
   * 获取 SKU 详情
   */
  @Get('sku/:id')
  getSkuById(@Param('id') id: string): Sku | undefined {
    return this.productsService.getSkuById(id);
  }

  /**
   * 检查库存
   */
  @Get('stock/check')
  checkStock(
    @Query('skuId') skuId: string,
    @Query('quantity') quantity: number,
  ): { available: boolean; stock?: number } {
    const available = this.productsService.checkStockAvailability(skuId, quantity);
    const sku = this.productsService.getSkuById(skuId);

    return {
      available,
      stock: sku ? sku.stock : undefined,
    };
  }

  /**
   * 获取可用的 SKU 组合
   */
  @Get(':id/sku-combinations')
  getAvailableSkuCombinations(@Param('id') id: string) {
    return this.productsService.getAvailableSkuCombinations(id);
  }

  /**
   * 获取商品属性信息
   */
  @Get(':id/attributes')
  getProductAttributes(@Param('id') id: string) {
    return this.productsService.getProductAttributes(id);
  }

  /**
   * 扣减库存
   */
  @Post('stock/deduct')
  deductStock(@Body() body: { skuId: string; quantity: number }) {
    const success = this.productsService.deductStock(body.skuId, body.quantity);
    return { success };
  }

  /**
   * 恢复库存
   */
  @Post('stock/restore')
  restoreStock(@Body() body: { skuId: string; quantity: number }) {
    const success = this.productsService.restoreStock(body.skuId, body.quantity);
    return { success };
  }
}
