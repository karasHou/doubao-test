import { defineStore } from 'pinia';
import type { Recipe, QueryRecipesDto } from '../types/recipe';
import { recipesApi, recommendationsApi } from '../services/api';

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [] as Recipe[],
    recommendations: [] as Recipe[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchRecipes(query: QueryRecipesDto = {}) {
      this.loading = true;
      this.error = null;
      try {
        this.recipes = (await recipesApi.getAll(query)) as Recipe[];
      } catch (err) {
        this.error = '获取菜谱列表失败';
        console.error('Error fetching recipes:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchRecipe(id: string): Promise<Recipe | null> {
      try {
        return (await recipesApi.getOne(id)) as Recipe;
      } catch (err) {
        this.error = '获取菜谱详情失败';
        console.error('Error fetching recipe:', err);
        return null;
      }
    },

    async fetchRecommendations() {
      try {
        const response = await recommendationsApi.getRecommendations();
        this.recommendations = (response as any).recipes as Recipe[];
        return response;
      } catch (err) {
        this.error = '获取推荐菜谱失败';
        console.error('Error fetching recommendations:', err);
        return null;
      }
    },

    async fetchRecommendationsByIngredients(ingredientIds: string[]) {
      try {
        return (await recommendationsApi.getByIngredients(ingredientIds)) as Recipe[];
      } catch (err) {
        this.error = '根据食材获取推荐失败';
        console.error('Error fetching recommendations by ingredients:', err);
        return [];
      }
    },
  },
});
