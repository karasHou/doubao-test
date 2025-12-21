<template>
  <div class="facility-list">
    <div class="list-header">
      <h2>设施列表</h2>
      <span class="count">{{ facilities.length }} 个结果</span>
    </div>

    <div class="list-content" v-if="!loading">
      <div
        v-for="facility in facilities"
        :key="facility.id"
        class="facility-item"
        :class="{ selected: selectedFacility?.id === facility.id }"
        @click="selectFacility(facility)"
      >
        <div class="facility-icon">
          {{ getFacilityIcon(facility.type) }}
        </div>
        <div class="facility-info">
          <h3>{{ facility.name }}</h3>
          <p class="address">{{ facility.address }}</p>
          <div class="facility-meta">
            <span class="distance">{{ facility.distance ? `${facility.distance}km` : '未知距离' }}</span>
            <span class="rating">★ {{ facility.rating }}</span>
            <span class="type">{{ getFacilityTypeName(facility.type) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" v-if="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'FacilityList',
  setup() {
    const store = useStore()

    const facilities = computed(() => store.getters['facilities/filteredFacilities'])
    const selectedFacility = computed(() => store.getters['facilities/selectedFacility'])
    const loading = computed(() => store.getters['facilities/loading'])

    const selectFacility = (facility) => {
      store.dispatch('facilities/selectFacility', facility)
    }

    const getFacilityIcon = (type) => {
      const icons = {
        toilet: '🚻',
        hospital: '🏥',
        charging_station: '⚡'
      }
      return icons[type] || '📍'
    }

    const getFacilityTypeName = (type) => {
      const names = {
        toilet: '公共厕所',
        hospital: '医院',
        charging_station: '充电桩'
      }
      return names[type] || '未知类型'
    }

    return {
      facilities,
      selectedFacility,
      loading,
      selectFacility,
      getFacilityIcon,
      getFacilityTypeName
    }
  }
}
</script>

<style scoped>
.facility-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.count {
  font-size: 0.875rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.625rem;
  border-radius: 1rem;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1.5rem;
}

.facility-item {
  display: flex;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.facility-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.facility-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.facility-icon {
  font-size: 2rem;
  margin-right: 1rem;
  display: flex;
  align-items: flex-start;
}

.facility-info {
  flex: 1;
}

.facility-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1e293b;
}

.address {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.facility-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.distance, .rating, .type {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.distance {
  background: #dbeafe;
  color: #1e40af;
}

.rating {
  background: #fef3c7;
  color: #92400e;
}

.type {
  background: #d1fae5;
  color: #065f46;
}

.loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
