import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { RecipesModule } from '../recipes/recipes.module';

@Module({
  imports: [IngredientsModule, RecipesModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
