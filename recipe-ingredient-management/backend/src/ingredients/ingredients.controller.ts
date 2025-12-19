import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  async create(@Body() createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  async findAll(): Promise<Ingredient[]> {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Ingredient> {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.ingredientsService.remove(id);
  }

  @Get('status/expired')
  async findExpired(): Promise<Ingredient[]> {
    return this.ingredientsService.findExpired();
  }

  @Get('status/expiring-soon')
  async findExpiringSoon(): Promise<Ingredient[]> {
    return this.ingredientsService.findExpiringSoon();
  }
}
