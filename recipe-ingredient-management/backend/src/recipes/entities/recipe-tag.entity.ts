import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Recipe } from './recipe.entity';

@Entity('recipe_tags')
export class RecipeTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.tags)
  recipe: Recipe;

  @Column({ length: 50 })
  tag: string;

  @CreateDateColumn()
  created_at: Date;
}
