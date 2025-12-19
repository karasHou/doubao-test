import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IngredientCategory } from './ingredient-category.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => IngredientCategory, { nullable: true })
  category: IngredientCategory;

  @Column({ type: 'numeric', default: 1 })
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  @Column({ type: 'date', nullable: true })
  expiration_date: Date;

  @Column({ default: false })
  is_expired: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
