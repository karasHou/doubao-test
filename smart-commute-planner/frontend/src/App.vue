<script setup lang="ts">
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Configuration
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'

// State
const start = ref('天安门')
const end = ref('中关村')
const mode = ref('all')
const filter = ref('all')
const routes = ref<any[]>([])
const selectedRoute = ref<any>(null)
const loading = ref(false)
const mapLoaded = ref(false)
let map: mapboxgl.Map | null = null
let pendingRoute: any | null = null
let currentLayers: string[] = []

// Fetch routes from backend
const fetchRoutes = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3002/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: start.value,
        end: end.value,
        mode: mode.value,
        filter: filter.value
      })
    })
    routes.value = await response.json()
    if (routes.value.length > 0) {
      selectRoute(routes.value[0])
    }
  } catch (error) {
    console.error('Error fetching routes:', error)
  } finally {
    loading.value = false
  }
}

// Select a route and display on map
const selectRoute = (route: any) => {
  selectedRoute.value = route
  displayRouteOnMap(route)
}

// Display route on map
const displayRouteOnMap = (route: any) => {
  if (!map || !route.coordinates) return

  // If map is not loaded yet, save the route as pending to display later
  if (!mapLoaded.value) {
    pendingRoute = route
    return
  }

  // Clear previous layers
  currentLayers.forEach(layerId => {
    if (map?.getLayer(layerId)) {
      map?.removeLayer(layerId)
    }
    if (map?.getSource(layerId)) {
      map?.removeSource(layerId)
    }
  })
  currentLayers = []

  // Add route line
  const routeId = `route-${route.id}`
  map.addSource(routeId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.coordinates
      }
    }
  })

  map.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': getRouteColor(route.type),
      'line-width': 4
    }
  })

  currentLayers.push(routeId)

  // Fit map to route bounds
  const bounds = new mapboxgl.LngLatBounds()
  route.coordinates.forEach((coord: [number, number]) => {
    bounds.extend(coord)
  })
  map.fitBounds(bounds, { padding: 50 })
}

// Get color based on route type
const getRouteColor = (type: string): string => {
  switch (type) {
    case 'subway': return '#ff6b6b'
    case 'bus': return '#4ecdc4'
    case 'walk': return '#45b7d1'
    default: return '#96ceb4'
  }
}

// Get route type text
const getRouteTypeText = (type: string): string => {
  switch (type) {
    case 'subway': return '地铁'
    case 'bus': return '公交'
    case 'walk': return '步行'
    default: return '其他'
  }
}

// Initialize map on mount
onMounted(() => {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [116.397428, 39.90923],
    zoom: 11
  })

  // Add map loaded event listener
  map.on('load', () => {
    mapLoaded.value = true
    console.log('Map loaded successfully!')

    // If there is a pending route to display, show it now
    if (pendingRoute) {
      displayRouteOnMap(pendingRoute)
      pendingRoute = null
    }
  })

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl())

  // Fetch initial routes
  fetchRoutes()
})
</script>

<template>
  <div class="app-container">
    <header class="header">
      <h1>智能通勤路线规划工具</h1>
    </header>

    <main class="main-content">
      <div class="sidebar">
        <div class="input-section">
          <label>起点</label>
          <input v-model="start" type="text" placeholder="输入起点" />
        </div>
        <div class="input-section">
          <label>终点</label>
          <input v-model="end" type="text" placeholder="输入终点" />
        </div>
        <div class="input-section">
          <label>出行方式</label>
          <select v-model="mode">
            <option value="all">全部</option>
            <option value="subway">地铁</option>
            <option value="bus">公交</option>
            <option value="walk">步行</option>
          </select>
        </div>
        <div class="input-section">
          <label>路线偏好</label>
          <select v-model="filter">
            <option value="all">全部</option>
            <option value="fastest">最快</option>
            <option value="least-transfers">最少换乘</option>
          </select>
        </div>
        <button class="search-btn" @click="fetchRoutes" :disabled="loading">
          {{ loading ? '搜索中...' : '搜索路线' }}
        </button>

        <div class="routes-list">
          <h3>路线方案</h3>
          <div
            v-for="route in routes"
            :key="route.id"
            class="route-item"
            :class="{ selected: selectedRoute?.id === route.id }"
            @click="selectRoute(route)"
          >
            <div class="route-header">
              <span class="route-type">{{ getRouteTypeText(route.type) }}</span>
              <span class="route-duration">{{ route.duration }}分钟</span>
            </div>
            <div class="route-info">
              <span>距离: {{ route.distance }}km</span>
              <span>换乘: {{ route.transfers }}次</span>
            </div>
            <div class="route-stations">
              {{ route.stations.join(' → ') }}
            </div>
          </div>
        </div>
      </div>

      <div class="map-container">
        <div id="map" class="map"></div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.header {
  background: #4a90d9;
  color: white;
  padding: 1rem;
  text-align: center;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 400px;
  background: #f5f5f5;
  padding: 1rem;
  overflow-y: auto;
}

.input-section {
  margin-bottom: 1rem;
}

.input-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.input-section input,
.input-section select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.search-btn {
  width: 100%;
  padding: 0.75rem;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.search-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.routes-list h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.route-item {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  border: 2px solid transparent;
}

.route-item:hover {
  border-color: #4a90d9;
}

.route-item.selected {
  border-color: #4a90d9;
  background: #e8f4f8;
}

.route-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.route-type {
  color: #4a90d9;
}

.route-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.route-stations {
  font-size: 0.8rem;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-container {
  flex: 1;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}
</style>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
</style>
