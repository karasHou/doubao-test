import { Module } from '@nestjs/common';
import { PriceEngineService } from './price-engine.service';
import { PriceEngineController } from './price-engine.controller';

@Module({
  controllers: [PriceEngineController],
  providers: [PriceEngineService],
  exports: [PriceEngineService],
})
export class PriceEngineModule {}
