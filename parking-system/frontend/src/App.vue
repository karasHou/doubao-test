<template>
  <div id="app">
    <header class="header">
      <h1>城市停车位查询工具</h1>
      <div class="filters">
        <div class="filter-group">
          <label>价格筛选:</label>
          <select v-model="priceFilter" @change="updateFilters">
            <option value="">全部</option>
            <option value="10">≤ 10元/小时</option>
            <option value="15">≤ 15元/小时</option>
            <option value="20">≤ 20元/小时</option>
          </select>
        </div>
        <div class="filter-group">
          <label>距离筛选:</label>
          <select v-model="distanceFilter" @change="updateFilters">
            <option value="">全部</option>
            <option value="1">≤ 1公里</option>
            <option value="3">≤ 3公里</option>
            <option value="5">≤ 5公里</option>
          </select>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div id="map" class="map-container"></div>

      <div class="sidebar">
        <h2>停车场列表</h2>
        <div v-if="loading" class="loading">加载中...</div>
        <div
          v-for="lot in filteredParkingLots"
          :key="lot.id"
          class="parking-item"
          :class="{ selected: selectedLot?.id === lot.id }"
          @click="selectParkingLot(lot)"
        >
          <h3>{{ lot.name }}</h3>
          <p>{{ lot.address }}</p>
          <div class="parking-info">
            <span>价格: ¥{{ lot.pricePerHour }}/小时</span>
            <span>剩余车位: {{ lot.availableSpots }}/{{ lot.totalSpots }}</span>
          </div>
          <button class="predict-btn" @click.stop="showPrediction(lot)">
            预测
          </button>
        </div>
      </div>
    </main>

    <div v-if="showPredictionModal" class="modal">
      <div class="modal-content">
        <h3>{{ selectedLot?.name }} - 车位预测</h3>
        <div v-if="prediction" class="prediction-info">
          <p>预测时间: {{ prediction.predictionHour }}:00</p>
          <p>预计剩余: {{ prediction.predictedAvailableSpots }} 个车位</p>
          <p>置信度: {{ (prediction.confidence * 100).toFixed(0) }}%</p>
        </div>
        <button class="close-btn" @click="showPredictionModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';

// 使用公开的 Mapbox access token 或配置
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaGF1dG9vbmciLCJhIjoiY2xkdmgwMXFpMDBsNjN3bnhxZnN3djJwYSJ9.7V4VJz5jTjKq8X8z1v8z6w';

interface ParkingLot {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpots: number;
  availableSpots: number;
  pricePerHour: number;
}

interface Prediction {
  parkingLotId: number;
  predictedAvailableSpots: number;
  predictionHour: number;
  confidence: number;
}

const parkingLots = ref<ParkingLot[]>([]);
const loading = ref(true);
const mapLoading = ref(true);
const selectedLot = ref<ParkingLot | null>(null);
const showPredictionModal = ref(false);
const prediction = ref<Prediction | null>(null);
const priceFilter = ref<string>('');
const distanceFilter = ref<string>('');

let map: mapboxgl.Map | null = null;
let markers: mapboxgl.Marker[] = [];

const filteredParkingLots = computed(() => {
  return parkingLots.value.filter(lot => {
    const matchesPrice = !priceFilter.value || lot.pricePerHour <= parseInt(priceFilter.value);
    return matchesPrice;
  });
});

const initMap = () => {
  console.log('Initializing map...');
  console.log('Mapbox access token:', mapboxgl.accessToken ? 'Set' : 'Not set');

  try {
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [121.4737, 31.2304],
      zoom: 12
    });

    console.log('Map instance created');

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      console.log('Map loaded successfully');
      mapLoading.value = false;
      addMarkers();
    });

    map.on('error', (e) => {
      console.error('Map error event:', e);
      mapLoading.value = false;
    });

    map.on('styleimagemissing', (e) => {
      console.error('Style image missing:', e);
    });
  } catch (error) {
    console.error('Failed to initialize map:', error);
    mapLoading.value = false;
  }
};

const loadParkingLots = async () => {
  try {
    const response = await axios.get('/api/parking/lots');
    parkingLots.value = response.data;
  } catch (error) {
    console.error('Error loading parking lots:', error);
  } finally {
    loading.value = false;
  }
};

const addMarkers = () => {
  markers.forEach(marker => marker.remove());
  markers = [];

  parkingLots.value.forEach(lot => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.background = `rgb(${255 - (lot.availableSpots / lot.totalSpots) * 255}, ${(lot.availableSpots / lot.totalSpots) * 255}, 0)`;
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';

    const marker = new mapboxgl.Marker(el)
      .setLngLat([lot.longitude, lot.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3>${lot.name}</h3>
        <p>${lot.address}</p>
        <p>剩余车位: ${lot.availableSpots}/${lot.totalSpots}</p>
        <p>价格: ¥${lot.pricePerHour}/小时</p>
      `))
      .addTo(map!);

    markers.push(marker);
  });
};

const selectParkingLot = (lot: ParkingLot) => {
  selectedLot.value = lot;
  if (map) {
    map.flyTo({
      center: [lot.longitude, lot.latitude],
      zoom: 15
    });
  }
};

const showPrediction = async (lot: ParkingLot) => {
  selectedLot.value = lot;
  showPredictionModal.value = true;

  try {
    const response = await axios.get(`/api/parking/lots/${lot.id}/predict`);
    prediction.value = response.data;
  } catch (error) {
    console.error('Error getting prediction:', error);
  }
};

const updateFilters = () => {
  addMarkers();
};

onMounted(() => {
  initMap();
  loadParkingLots();
});
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters {
  display: flex;
  gap: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.main-content {
  flex: 1;
  display: flex;
}

.map-container {
  flex: 1;
}

.sidebar {
  width: 350px;
  background: #ecf0f1;
  overflow-y: auto;
  padding: 1rem;
}

.parking-item {
  background: white;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.parking-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.parking-item.selected {
  border: 2px solid #3498db;
}

.parking-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.predict-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.close-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}
</style>