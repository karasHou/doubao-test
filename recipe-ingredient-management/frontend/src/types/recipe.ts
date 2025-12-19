export interface RecipeIngredient {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export interface RecipeTag {
  id: string;
  tag: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  cooking_time: number;
  difficulty: string;
  cuisine_type?: string;
  servings: number;
  instructions: string;
  ingredients: RecipeIngredient[];
  tags: RecipeTag[];
  created_at: string;
  updated_at: string;
}

export interface QueryRecipesDto {
  difficulty?: string;
  cuisine_type?: string;
  max_cooking_time?: number;
  tag?: string;
}
