import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from '../products/products.module';
import { PriceEngineModule } from '../price-engine/price-engine.module';

@Module({
  imports: [ProductsModule, PriceEngineModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
