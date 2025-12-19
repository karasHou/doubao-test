import { Controller, Get, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { Recipe } from '../recipes/entities/recipe.entity';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  async getRecommendations() {
    return this.recommendationsService.getRecommendations();
  }

  @Get('by-ingredients')
  async getRecommendationsByIngredients(
    @Query('ingredient_ids') ingredientIds: string,
  ): Promise<Recipe[]> {
    const ids = ingredientIds ? ingredientIds.split(',').filter(Boolean) : [];
    return this.recommendationsService.getRecommendedRecipesByIngredientIds(ids);
  }
}
