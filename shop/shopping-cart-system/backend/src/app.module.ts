import { Module } from '@nestjs/common';
import { PriceEngineModule } from './price-engine/price-engine.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [PriceEngineModule, ProductsModule, CartModule],
})
export class AppModule {}
