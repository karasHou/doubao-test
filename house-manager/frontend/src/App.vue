<template>
  <div class="app">
    <header class="header">
      <h1>🏠 房屋租赁信息聚合工具</h1>
    </header>

    <main class="main-content">
      <aside class="filters-sidebar">
        <h2>筛选条件</h2>

        <div class="filter-group">
          <label>价格范围</label>
          <input v-model.number="filters.minPrice" type="number" placeholder="最低价格">
          <input v-model.number="filters.maxPrice" type="number" placeholder="最高价格">
        </div>

        <div class="filter-group">
          <label>户型</label>
          <select v-model.number="filters.rooms">
            <option value="">全部</option>
            <option value="1">一居室</option>
            <option value="2">二居室</option>
            <option value="3">三居室</option>
            <option value="4">四居室及以上</option>
          </select>
        </div>

        <div class="filter-group">
          <label>位置</label>
          <input v-model="filters.location" type="text" placeholder="输入位置关键词">
        </div>

        <div class="filter-group">
          <label>排序</label>
          <select v-model="filters.sortBy">
            <option value="">默认排序</option>
            <option value="price-asc">价格从低到高</option>
            <option value="price-desc">价格从高到低</option>
          </select>
        </div>

        <button @click="applyFilters">应用筛选</button>
      </aside>

      <div class="main-content-area">
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">列表模式</button>
          <button :class="{ active: viewMode === 'map' }" @click="viewMode = 'map'">地图模式</button>
        </div>

        <div v-if="viewMode === 'list'" class="houses-list">
          <div v-for="house in houses" :key="house.id" class="house-card">
            <img :src="house.images[0]" :alt="house.title">
            <div class="house-info">
              <h3>{{ house.title }}</h3>
              <p class="price">¥{{ house.price }}/月</p>
              <p class="location">{{ house.location }}</p>
              <p class="details">{{ house.rooms }}室 · {{ house.area }}㎡</p>
              <p class="description">{{ house.description }}</p>
            </div>
          </div>
        </div>

        <div v-else class="map-container">
          <div class="map-placeholder">
            <h3>地图展示区域</h3>
            <p>当前共 {{ houses.length }} 套房源</p>
            <div class="map-markers">
              <div v-for="house in houses" :key="house.id" class="map-marker">
                📍 {{ house.title }} - ¥{{ house.price }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  setup() {
    const houses = ref([])
    const viewMode = ref('list')
    const filters = ref({
      minPrice: '',
      maxPrice: '',
      rooms: '',
      location: '',
      sortBy: ''
    })

    const fetchHouses = async (params = {}) => {
      try {
        const response = await axios.get('/api/houses', { params })
        houses.value = response.data.data
      } catch (error) {
        console.error('获取房源数据失败:', error)
      }
    }

    const applyFilters = () => {
      const params = Object.fromEntries(
        Object.entries(filters.value).filter(([_, v]) => v !== '' && v != null)
      )
      fetchHouses(params)
    }

    onMounted(() => {
      fetchHouses()
    })

    return {
      houses,
      viewMode,
      filters,
      applyFilters
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.main-content {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
}

.filters-sidebar {
  width: 300px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
}

button:hover {
  opacity: 0.9;
}

.main-content-area {
  flex: 1;
}

.view-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.view-toggle button {
  width: auto;
  padding: 10px 20px;
  background: #e9ecef;
  color: #495057;
  border: 1px solid #dee2e6;
}

.view-toggle button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.houses-list {
  display: grid;
  gap: 20px;
}

.house-card {
  display: flex;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.3s;
}

.house-card:hover {
  transform: translateY(-5px);
}

.house-card img {
  width: 300px;
  height: 200px;
  object-fit: cover;
}

.house-info {
  padding: 20px;
  flex: 1;
}

.house-info h3 {
  margin-bottom: 10px;
  color: #333;
}

.price {
  font-size: 24px;
  color: #667eea;
  font-weight: bold;
  margin-bottom: 10px;
}

.location {
  color: #666;
  margin-bottom: 5px;
}

.details {
  color: #888;
  margin-bottom: 10px;
}

.description {
  color: #555;
  line-height: 1.5;
}

.map-container {
  height: 600px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  overflow: hidden;
}

.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.map-markers {
  margin-top: 20px;
  text-align: center;
}

.map-marker {
  margin: 5px 0;
  padding: 5px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
