<template>
  <div class="resource-filter">
    <div class="filter-title">资源筛选</div>

    <!-- 资源类型筛选 -->
    <div class="filter-group">
      <label class="filter-label">资源类型</label>
      <select v-model="selectedType" @change="onTypeChange" class="filter-select">
        <option value="">全部</option>
        <option value="plant">植物</option>
        <option value="animal">动物</option>
        <option value="mineral">矿产</option>
        <option value="task">任务</option>
      </select>
    </div>

    <!-- 稀有度筛选 -->
    <div class="filter-group">
      <label class="filter-label">稀有度</label>
      <select v-model="selectedRarity" @change="onRarityChange" class="filter-select">
        <option value="">全部</option>
        <option value="common">普通</option>
        <option value="uncommon"> uncommon</option>
        <option value="rare">稀有</option>
        <option value="epic">史诗</option>
        <option value="legendary">传奇</option>
      </select>
    </div>

    <!-- 等级范围筛选 -->
    <div class="filter-group">
      <label class="filter-label">等级范围</label>
      <div class="level-range">
        <input
          v-model.number="minLevel"
          @change="onLevelChange"
          type="number"
          min="1"
          placeholder="最小"
          class="level-input"
        />
        <span class="level-separator">-</span>
        <input
          v-model.number="maxLevel"
          @change="onLevelChange"
          type="number"
          min="1"
          placeholder="最大"
          class="level-input"
        />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="filter-actions">
      <button @click="onReset" class="btn-reset">重置</button>
      <button @click="onApply" class="btn-apply">应用</button>
    </div>

    <!-- 资源数量统计 -->
    <div class="resource-stats">
      <span>找到 {{ mapStore.totalResources }} 个资源点</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMapStore } from '../store/mapStore';
import { ResourceType, ResourceRarity } from '../types/resource';

// Pinia Store
const mapStore = useMapStore();

// 筛选条件的本地状态
const selectedType = ref<ResourceType | ''>('');
const selectedRarity = ref<ResourceRarity | ''>('');
const minLevel = ref<number | ''>('');
const maxLevel = ref<number | ''>('');

/**
 * 类型筛选变化
 */
const onTypeChange = () => {
  mapStore.setFilters({
    type: selectedType.value || undefined,
  });
};

/**
 * 稀有度筛选变化
 */
const onRarityChange = () => {
  mapStore.setFilters({
    rarity: selectedRarity.value || undefined,
  });
};

/**
 * 等级范围筛选变化
 */
const onLevelChange = () => {
  mapStore.setFilters({
    minLevel: minLevel.value || undefined,
    maxLevel: maxLevel.value || undefined,
  });
};

/**
 * 应用筛选条件
 */
const onApply = () => {
  mapStore.setFilters({
    type: selectedType.value || undefined,
    rarity: selectedRarity.value || undefined,
    minLevel: minLevel.value || undefined,
    maxLevel: maxLevel.value || undefined,
  });
};

/**
 * 重置筛选条件
 */
const onReset = () => {
  // 重置本地状态
  selectedType.value = '';
  selectedRarity.value = '';
  minLevel.value = '';
  maxLevel.value = '';

  // 重置 Pinia Store 中的筛选条件
  mapStore.resetFilters();
};

/**
 * 生命周期钩子 - 挂载
 */
onMounted(() => {
  // 初始化本地状态为 Pinia Store 中的筛选条件
  selectedType.value = mapStore.filters.type || '';
  selectedRarity.value = mapStore.filters.rarity || '';
  minLevel.value = mapStore.filters.minLevel || '';
  maxLevel.value = mapStore.filters.maxLevel || '';
});
</script>

<style scoped>
.resource-filter {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-width: 280px;
  max-width: 320px;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background-color: #ffffff;
  transition: border-color 0.3s ease;
  cursor: pointer;
}

.filter-select:hover,
.filter-select:focus {
  outline: none;
  border-color: #51bbd6;
  box-shadow: 0 0 0 2px rgba(81, 187, 214, 0.1);
}

.level-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  text-align: center;
  transition: border-color 0.3s ease;
}

.level-input:hover,
.level-input:focus {
  outline: none;
  border-color: #51bbd6;
  box-shadow: 0 0 0 2px rgba(81, 187, 214, 0.1);
}

.level-separator {
  font-size: 16px;
  color: #999;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.btn-reset,
.btn-apply {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset {
  background-color: #f5f5f5;
  color: #666;
}

.btn-reset:hover {
  background-color: #e0e0e0;
  color: #555;
}

.btn-apply {
  background-color: #51bbd6;
  color: #ffffff;
}

.btn-apply:hover {
  background-color: #3a9eb8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(81, 187, 214, 0.3);
}

.resource-stats {
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  font-size: 13px;
  color: #666;
  text-align: center;
}
</style>
