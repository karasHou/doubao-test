import { Injectable } from '@nestjs/common';
import { IngredientsService } from '../ingredients/ingredients.service';
import { RecipesService } from '../recipes/recipes.service';
import { Recipe } from '../recipes/entities/recipe.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly ingredientsService: IngredientsService,
    private readonly recipesService: RecipesService,
    private readonly cacheService: CacheService,
  ) {}

  async getRecommendations(): Promise<{ recipes: Recipe[]; matchedCounts: Record<string, number> }> {
    // 尝试从缓存获取
    const cachedRecommendations = await this.cacheService.get<any>('recommendations:all');
    if (cachedRecommendations) {
      return cachedRecommendations;
    }

    // 获取所有食材和菜谱
    const ingredients = await this.ingredientsService.findAll();
    const recipes = await this.recipesService.findAll({});

    // 计算推荐分数
    const ingredientsMap = new Map(
      ingredients.map((ing) => [ing.name.toLowerCase(), ing]),
    );

    const recommendations = recipes.map((recipe) => {
      let matchCount = 0;
      let totalRequired = 0;

      if (recipe.ingredients) {
        totalRequired = recipe.ingredients.length;

        for (const recipeIng of recipe.ingredients) {
          const ingredientName = recipeIng.ingredient_name.toLowerCase();
          if (ingredientsMap.has(ingredientName)) {
            matchCount++;
          }
        }
      }

      return { recipe, matchCount, totalRequired };
    });

    // 排序：匹配数量多的在前
    recommendations.sort((a, b) => b.matchCount - a.matchCount);

    // 构建结果
    const resultRecipes = recommendations.map((r) => r.recipe);
    const matchedCounts = Object.fromEntries(
      recommendations.map((r) => [r.recipe.id, r.matchCount]),
    );

    const result = { recipes: resultRecipes, matchedCounts };

    // 缓存 10 分钟
    await this.cacheService.set('recommendations:all', result, 600);

    return result;
  }

  async getRecommendedRecipesByIngredientIds(ingredientIds: string[]): Promise<Recipe[]> {
    const cacheKey = `recommendations:ingredients:${ingredientIds.sort().join(',')}`;
    const cached = await this.cacheService.get<Recipe[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const ingredients = await Promise.all(
      ingredientIds.map((id) => this.ingredientsService.findOne(id)),
    );

    const recipes = await this.recipesService.findAll({});
    const ingredientsMap = new Map(
      ingredients.map((ing) => [ing.name.toLowerCase(), ing]),
    );

    const recommended = recipes.filter((recipe) => {
      if (!recipe.ingredients) return false;

      for (const recipeIng of recipe.ingredients) {
        const ingredientName = recipeIng.ingredient_name.toLowerCase();
        if (ingredientsMap.has(ingredientName)) {
          return true;
        }
      }
      return false;
    });

    // 缓存 5 分钟
    await this.cacheService.set(cacheKey, recommended, 300);

    return recommended;
  }
}
