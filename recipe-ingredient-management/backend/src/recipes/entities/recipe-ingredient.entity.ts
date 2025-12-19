import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Recipe } from './recipe.entity';

@Entity('recipe_ingredients')
export class RecipeIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients)
  recipe: Recipe;

  @Column({ length: 100 })
  ingredient_name: string;

  @Column({ type: 'numeric' })
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  @CreateDateColumn()
  created_at: Date;
}
