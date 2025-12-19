import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async findAll(@Query() query: QueryRecipesDto): Promise<Recipe[]> {
    return this.recipesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Recipe> {
    return this.recipesService.findOne(id);
  }

  @Get(':id/ingredients')
  async getIngredients(@Param('id') id: string): Promise<RecipeIngredient[]> {
    return this.recipesService.getRecipeIngredients(id);
  }
}
