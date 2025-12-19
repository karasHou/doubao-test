import { defineStore } from 'pinia';
import type { Ingredient, CreateIngredientDto, UpdateIngredientDto } from '../types/ingredient';
import { ingredientsApi } from '../services/api';

export const useIngredientStore = defineStore('ingredient', {
  state: () => ({
    ingredients: [] as Ingredient[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchIngredients() {
      this.loading = true;
      this.error = null;
      try {
        this.ingredients = (await ingredientsApi.getAll()) as Ingredient[];
      } catch (err) {
        this.error = '获取食材列表失败';
        console.error('Error fetching ingredients:', err);
      } finally {
        this.loading = false;
      }
    },

    async addIngredient(ingredient: CreateIngredientDto) {
      try {
        const newIngredient = (await ingredientsApi.create(ingredient)) as Ingredient;
        this.ingredients.push(newIngredient);
      } catch (err) {
        this.error = '添加食材失败';
        console.error('Error adding ingredient:', err);
        throw err;
      }
    },

    async updateIngredient(id: string, updates: UpdateIngredientDto) {
      try {
        const updatedIngredient = (await ingredientsApi.update(id, updates)) as Ingredient;
        const index = this.ingredients.findIndex((ing) => ing.id === id);
        if (index !== -1) {
          this.ingredients[index] = updatedIngredient;
        }
      } catch (err) {
        this.error = '更新食材失败';
        console.error('Error updating ingredient:', err);
        throw err;
      }
    },

    async deleteIngredient(id: string) {
      try {
        await ingredientsApi.delete(id);
        this.ingredients = this.ingredients.filter((ing) => ing.id !== id);
      } catch (err) {
        this.error = '删除食材失败';
        console.error('Error deleting ingredient:', err);
        throw err;
      }
    },

    async fetchExpiredIngredients() {
      try {
        return await ingredientsApi.getExpired();
      } catch (err) {
        this.error = '获取过期食材失败';
        console.error('Error fetching expired ingredients:', err);
        return [];
      }
    },

    async fetchExpiringSoonIngredients() {
      try {
        return await ingredientsApi.getExpiringSoon();
      } catch (err) {
        this.error = '获取即将过期食材失败';
        console.error('Error fetching expiring soon ingredients:', err);
        return [];
      }
    },
  },
});
