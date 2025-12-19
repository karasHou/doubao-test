<script setup lang="ts">
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import MapView from './components/MapView.vue';
import ResourceFilter from './components/ResourceFilter.vue';

// 初始化 Pinia
const pinia = createPinia();

// 初始化应用 (在 main.ts 中统一处理)
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">🎮 游戏资源地图查询系统</h1>
      <p class="app-subtitle">探索游戏世界，发现稀有资源</p>
    </header>

    <main class="app-main">
      <!-- 资源筛选组件 -->
      <aside class="filter-sidebar">
        <ResourceFilter />
      </aside>

      <!-- 地图组件 -->
      <section class="map-section">
        <MapView />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8fafc;
}

.app-header {
  background-color: #1e293b;
  color: #ffffff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.app-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #51bbd6;
}

.app-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.filter-sidebar {
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

.map-section {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>

<style>
/* 全局样式重置 */
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
