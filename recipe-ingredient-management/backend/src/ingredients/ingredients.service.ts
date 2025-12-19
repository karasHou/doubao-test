import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';
import { IngredientCategory } from './entities/ingredient-category.entity';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(IngredientCategory)
    private readonly categoryRepository: Repository<IngredientCategory>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    const { category_id, ...ingredientData } = createIngredientDto;

    const ingredient = this.ingredientRepository.create(ingredientData);

    if (category_id) {
      const category = await this.categoryRepository.findOne({ where: { id: category_id } });
      if (category) {
        ingredient.category = category;
      }
    }

    // 检查是否过期
    if (ingredient.expiration_date) {
      ingredient.is_expired = new Date() > new Date(ingredient.expiration_date);
    }

    return this.ingredientRepository.save(ingredient);
  }

  async findAll(): Promise<Ingredient[]> {
    const ingredients = await this.ingredientRepository.find({
      relations: ['category'],
    });

    // 更新过期状态
    for (const ingredient of ingredients) {
      if (ingredient.expiration_date) {
        const isExpired = new Date() > new Date(ingredient.expiration_date);
        if (ingredient.is_expired !== isExpired) {
          ingredient.is_expired = isExpired;
          await this.ingredientRepository.save(ingredient);
        }
      }
    }

    return ingredients;
  }

  async findOne(id: string): Promise<Ingredient> {
    return this.ingredientRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<Ingredient> {
    const { category_id, ...ingredientData } = updateIngredientDto as { [key: string]: any };

    const ingredient = await this.ingredientRepository.findOne({ where: { id } });

    if (category_id) {
      const category = await this.categoryRepository.findOne({ where: { id: category_id } });
      if (category) {
        ingredient.category = category;
      }
    }

    Object.assign(ingredient, ingredientData);

    // 检查是否过期
    if (ingredient.expiration_date) {
      ingredient.is_expired = new Date() > new Date(ingredient.expiration_date);
    }

    return this.ingredientRepository.save(ingredient);
  }

  async remove(id: string): Promise<void> {
    await this.ingredientRepository.delete(id);
  }

  async findExpired(): Promise<Ingredient[]> {
    return this.ingredientRepository.find({
      where: { is_expired: true },
      relations: ['category'],
    });
  }

  async findExpiringSoon(days: number = 3): Promise<Ingredient[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.ingredientRepository
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.category', 'category')
      .where('ingredient.expiration_date <= :futureDate', { futureDate })
      .andWhere('ingredient.is_expired = false')
      .getMany();
  }
}
