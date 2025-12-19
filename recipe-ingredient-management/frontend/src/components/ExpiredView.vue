<template>
  <div>
    <h2>食材过期提醒</h2>

    <div class="card">
      <h3>已过期食材</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="expiredIngredients.length === 0" class="empty-state">
        暂无已过期食材，很棒！
      </div>
      <div v-else class="grid grid-3">
        <div v-for="ingredient in expiredIngredients" :key="ingredient.id" class="card warning-card">
          <div class="ingredient-name">{{ ingredient.name }}</div>
          <div class="ingredient-info">
            <span>数量: {{ ingredient.quantity }} {{ ingredient.unit }}</span>
            <span>过期日期: {{ formatDate(ingredient.expiration_date) }}</span>
          </div>
          <button class="btn btn-danger" @click="deleteIngredient(ingredient.id)">删除</button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>即将过期食材 (3天内)</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="expiringSoonIngredients.length === 0" class="empty-state">
        暂无即将过期食材
      </div>
      <div v-else class="grid grid-3">
        <div v-for="ingredient in expiringSoonIngredients" :key="ingredient.id" class="card warning-card soon">
          <div class="ingredient-name">{{ ingredient.name }}</div>
          <div class="ingredient-info">
            <span>数量: {{ ingredient.quantity }} {{ ingredient.unit }}</span>
            <span>过期日期: {{ formatDate(ingredient.expiration_date) }}</span>
          </div>
          <button class="btn btn-secondary" @click="deleteIngredient(ingredient.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIngredientStore } from '../store/ingredientStore';

const ingredientStore = useIngredientStore();
const loading = ref(true);
const expiredIngredients = ref<any[]>([]);
const expiringSoonIngredients = ref<any[]>([]);

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    expiredIngredients.value = (await ingredientStore.fetchExpiredIngredients()) as any[];
    expiringSoonIngredients.value = (await ingredientStore.fetchExpiringSoonIngredients()) as any[];
  } catch (err) {
    console.error('加载数据失败:', err);
  } finally {
    loading.value = false;
  }
};

const deleteIngredient = async (id: string) => {
  if (confirm('确定要删除这个食材吗？')) {
    await ingredientStore.deleteIngredient(id);
    await loadData();
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.warning-card {
  background: #fff3cd;
  border: 1px solid #ffc107;
}

.warning-card.soon {
  background: #fff3e0;
  border: 1px solid #ff9800;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #666;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}
</style>
