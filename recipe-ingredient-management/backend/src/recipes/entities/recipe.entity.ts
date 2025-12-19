import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { RecipeTag } from './recipe-tag.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  cooking_time: number;

  @Column({ length: 20 })
  difficulty: string;

  @Column({ length: 50, nullable: true })
  cuisine_type: string;

  @Column({ default: 1 })
  servings: number;

  @Column({ type: 'text' })
  instructions: string;

  @OneToMany(() => RecipeIngredient, (recipeIngredient) => recipeIngredient.recipe)
  ingredients: RecipeIngredient[];

  @OneToMany(() => RecipeTag, (recipeTag) => recipeTag.recipe)
  tags: RecipeTag[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
