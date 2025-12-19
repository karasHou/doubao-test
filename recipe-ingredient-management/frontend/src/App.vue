<template>
  <div id="app">
    <header class="app-header">
      <h1>智能菜谱与食材管理系统</h1>
      <nav class="nav-tabs">
        <button :class="['tab-btn', { active: currentTab === 'ingredients' }]" @click="currentTab = 'ingredients'">
          食材管理
        </button>
        <button :class="['tab-btn', { active: currentTab === 'recipes' }]" @click="currentTab = 'recipes'">
          菜谱推荐
        </button>
        <button :class="['tab-btn', { active: currentTab === 'expired' }]" @click="currentTab = 'expired'">
          过期提醒
        </button>
      </nav>
    </header>

    <main class="container">
      <IngredientsView v-if="currentTab === 'ingredients'" />
      <RecipesView v-if="currentTab === 'recipes'" />
      <ExpiredView v-if="currentTab === 'expired'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IngredientsView from './components/IngredientsView.vue';
import RecipesView from './components/RecipesView.vue';
import ExpiredView from './components/ExpiredView.vue';

const currentTab = ref('ingredients');
</script>

<style scoped>
.app-header {
  background: #2c3e50;
  color: white;
  padding: 20px 0;
  margin-bottom: 30px;
}

.app-header h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
}

.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 20px;
  background: #34495e;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.tab-btn:hover {
  background: #4a5f7a;
}

.tab-btn.active {
  background: #007bff;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 20px;
  }

  .nav-tabs {
    flex-direction: column;
    align-items: center;
  }

  .tab-btn {
    width: 200px;
  }
}
</style>
