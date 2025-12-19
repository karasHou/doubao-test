<template>
  <div>
    <div class="section-header">
      <h2>菜谱推荐</h2>
      <div class="filters">
        <select v-model="filterData.difficulty" @change="fetchRecipes">
          <option value="">所有难度</option>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>
        <select v-model="filterData.max_cooking_time" @change="fetchRecipes">
          <option value="">所有时间</option>
          <option value="15">15分钟以下</option>
          <option value="30">30分钟以下</option>
          <option value="60">60分钟以下</option>
        </select>
      </div>
    </div>

    <div class="recommendations-section">
      <h3>为您推荐的菜谱</h3>
      <button class="btn" @click="fetchRecommendations">重新推荐</button>
    </div>

    <div v-if="recipeStore.loading" class="loading">加载中...</div>
    <div v-else-if="recipeStore.error" class="error">{{ recipeStore.error }}</div>
    <div v-else>
      <div class="grid grid-2">
        <div v-for="recipe in recipeStore.recommendations" :key="recipe.id" class="card recipe-card">
          <div class="recipe-name">{{ recipe.name }}</div>
          <div class="recipe-meta">
            <span>⏱️ {{ recipe.cooking_time }}分钟</span>
            <span>难度: {{ recipe.difficulty }}</span>
            <span v-if="recipe.cuisine_type">菜系: {{ recipe.cuisine_type }}</span>
          </div>
          <div class="recipe-description" v-if="recipe.description">
            {{ recipe.description }}
          </div>
          <div class="recipe-tags">
            <span v-for="tag in recipe.tags" :key="tag.id" class="tag">{{ tag.tag }}</span>
          </div>
          <div class="recipe-actions">
            <button class="btn" @click="viewRecipe(recipe)">查看详情</button>
          </div>
        </div>
      </div>

      <div v-if="recipeStore.recommendations.length === 0" class="empty-state">
        暂无推荐菜谱，试试添加更多食材吧！
      </div>
    </div>

    <!-- 所有菜谱 -->
    <div class="all-recipes">
      <h3>所有菜谱</h3>
      <div class="grid grid-2">
        <div v-for="recipe in recipeStore.recipes" :key="recipe.id" class="card recipe-card">
          <div class="recipe-name">{{ recipe.name }}</div>
          <div class="recipe-meta">
            <span>⏱️ {{ recipe.cooking_time }}分钟</span>
            <span>难度: {{ recipe.difficulty }}</span>
          </div>
          <button class="btn" @click="viewRecipe(recipe)">查看详情</button>
        </div>
      </div>
    </div>

    <!-- 菜谱详情模态框 -->
    <div v-if="selectedRecipe" class="modal">
      <div class="modal-content recipe-detail">
        <h3>{{ selectedRecipe.name }}</h3>
        <div class="recipe-meta">
          <span>⏱️ {{ selectedRecipe.cooking_time }}分钟</span>
          <span>难度: {{ selectedRecipe.difficulty }}</span>
          <span>👥 {{ selectedRecipe.servings }}人份</span>
        </div>
        <div v-if="selectedRecipe.description" class="recipe-description">
          <h4>描述</h4>
          <p>{{ selectedRecipe.description }}</p>
        </div>
        <div>
          <h4>所需食材</h4>
          <ul>
            <li v-for="ing in selectedRecipe.ingredients" :key="ing.id">
              {{ ing.ingredient_name }} - {{ ing.quantity }} {{ ing.unit }}
            </li>
          </ul>
        </div>
        <div>
          <h4>烹饪步骤</h4>
          <pre>{{ selectedRecipe.instructions }}</pre>
        </div>
        <button class="btn btn-secondary" @click="selectedRecipe = null">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRecipeStore } from '../store/recipeStore';
import type { Recipe } from '../types/recipe';

const recipeStore = useRecipeStore();

const filterData = ref({
  difficulty: '',
  max_cooking_time: '',
});

const selectedRecipe = ref<Recipe | null>(null);

onMounted(() => {
  fetchRecipes();
  fetchRecommendations();
});

const fetchRecipes = () => {
  const query = {
    difficulty: filterData.value.difficulty || undefined,
    max_cooking_time: filterData.value.max_cooking_time ? parseInt(filterData.value.max_cooking_time) : undefined,
  };
  recipeStore.fetchRecipes(query);
};

const fetchRecommendations = () => {
  recipeStore.fetchRecommendations();
};

const viewRecipe = async (recipe: Recipe) => {
  const detailedRecipe = await recipeStore.fetchRecipe(recipe.id);
  if (detailedRecipe) {
    selectedRecipe.value = detailedRecipe;
  }
};
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.filters {
  display: flex;
  gap: 10px;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.recommendations-section {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.recipe-card {
  padding: 20px;
}

.recipe-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.recipe-meta {
  margin-bottom: 10px;
}

.recipe-meta span {
  display: inline-block;
  margin-right: 10px;
  font-size: 14px;
  background: #f0f0f0;
  padding: 2px 5px;
  border-radius: 3px;
}

.recipe-description {
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.recipe-tags {
  margin-bottom: 15px;
}

.tag {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.all-recipes {
  margin-top: 40px;
}

.recipe-detail {
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.recipe-detail ul {
  margin: 10px 0;
  padding-left: 20px;
}

.recipe-detail li {
  margin-bottom: 5px;
}

.recipe-detail pre {
  white-space: pre-wrap;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .section-header,
  .recommendations-section,
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
