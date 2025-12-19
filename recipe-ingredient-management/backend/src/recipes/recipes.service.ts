import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { RecipeTag } from './entities/recipe-tag.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
    @InjectRepository(RecipeTag)
    private readonly recipeTagRepository: Repository<RecipeTag>,
  ) {}

  async findAll(query: QueryRecipesDto): Promise<Recipe[]> {
    const queryBuilder = this.recipeRepository.createQueryBuilder('recipe');

    queryBuilder
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('recipe.tags', 'tags');

    if (query.difficulty) {
      queryBuilder.andWhere('recipe.difficulty = :difficulty', {
        difficulty: query.difficulty,
      });
    }

    if (query.cuisine_type) {
      queryBuilder.andWhere('recipe.cuisine_type = :cuisine_type', {
        cuisine_type: query.cuisine_type,
      });
    }

    if (query.max_cooking_time) {
      queryBuilder.andWhere('recipe.cooking_time <= :max_cooking_time', {
        max_cooking_time: query.max_cooking_time,
      });
    }

    if (query.tag) {
      queryBuilder.andWhere('tags.tag = :tag', { tag: query.tag });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Recipe> {
    return this.recipeRepository.findOne({
      where: { id },
      relations: ['ingredients', 'tags'],
    });
  }

  async getRecipeIngredients(recipeId: string): Promise<RecipeIngredient[]> {
    return this.recipeIngredientRepository.find({
      where: { recipe: { id: recipeId } },
    });
  }
}
