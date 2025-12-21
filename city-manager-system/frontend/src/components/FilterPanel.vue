<template>
  <div class="filter-panel">
    <h2>筛选条件</h2>

    <div class="filter-group">
      <label>设施类型</label>
      <select v-model="selectedType" @change="onFilterChange">
        <option value="">全部类型</option>
        <option value="toilet">公共厕所</option>
        <option value="hospital">医院</option>
        <option value="charging_station">充电桩</option>
      </select>
    </div>

    <div class="filter-group">
      <label>评分</label>
      <select v-model="selectedRating" @change="onFilterChange">
        <option value="">全部评分</option>
        <option value="3">3分及以上</option>
        <option value="4">4分及以上</option>
        <option value="4.5">4.5分及以上</option>
      </select>
    </div>

    <div class="filter-group">
      <label>排序方式</label>
      <select v-model="selectedSort" @change="onFilterChange">
        <option value="distance">距离优先</option>
        <option value="rating">评分优先</option>
      </select>
    </div>

    <button class="btn-reset" @click="resetFilters">重置筛选</button>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'FilterPanel',
  setup() {
    const store = useStore()

    const selectedType = computed({
      get: () => store.getters['facilities/filters'].type,
      set: (value) => store.dispatch('facilities/updateFilters', { type: value })
    })

    const selectedRating = computed({
      get: () => store.getters['facilities/filters'].rating,
      set: (value) => store.dispatch('facilities/updateFilters', { rating: value })
    })

    const selectedSort = computed({
      get: () => store.getters['facilities/filters'].sort,
      set: (value) => store.dispatch('facilities/updateFilters', { sort: value })
    })

    const resetFilters = () => {
      store.dispatch('facilities/updateFilters', {
        type: '',
        rating: '',
        sort: 'distance'
      })
    }

    const onFilterChange = () => {
      console.log('Filters updated')
    }

    onMounted(() => {
      store.dispatch('facilities/fetchFacilities')
    })

    return {
      selectedType,
      selectedRating,
      selectedSort,
      resetFilters,
      onFilterChange
    }
  }
}
</script>

<style scoped>
.filter-panel {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}

.filter-panel h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}

.filter-group select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s;
}

.filter-group select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-reset {
  width: 100%;
  padding: 0.625rem;
  background: #ef4444;
  color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-reset:hover {
  background: #dc2626;
}
</style>
