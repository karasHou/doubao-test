export interface IngredientCategory {
  id: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category?: IngredientCategory;
  quantity: number;
  unit: string;
  expiration_date?: string;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateIngredientDto {
  name: string;
  category_id?: string;
  quantity: number;
  unit: string;
  expiration_date?: string;
}

export interface UpdateIngredientDto extends Partial<CreateIngredientDto> {}
