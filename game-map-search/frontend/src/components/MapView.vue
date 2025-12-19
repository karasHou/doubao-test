<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>

    <!-- 加载指示器 -->
    <div v-if="mapStore.loading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <span>加载资源点数据...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore } from '../store/mapStore';
import { debounce } from '../utils/debounce';

// Mapbox 访问令牌 (需要用户在 Mapbox 官网注册获取)
// 注意: 生产环境中应该通过环境变量传入
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

// Pinia Store
const mapStore = useMapStore();

// DOM 引用
const mapContainer = ref<HTMLDivElement | null>(null);

// Mapbox 地图实例
let map: mapboxgl.Map | null = null;

// 地图资源点图层和源
let resourcesSource: mapboxgl.GeoJSONSource | null = null;
let resourcesLayer: any = null;

// 聚合点图层
let clusterLayer: any = null;
let clusterCountLayer: any = null;

/**
 * 初始化地图
 */
const initMap = () => {
  if (!mapContainer.value) return;

  // 创建地图实例
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12', // 街道样式
    center: [104.0, 30.0], // 初始中心点 (成都)
    zoom: 4, // 初始缩放级别
    minZoom: 2, // 最小缩放级别
    maxZoom: 18, // 最大缩放级别
  });

  // 设置地图实例到 Pinia Store
  mapStore.setMap(map);

  // 地图加载完成后初始化图层
  map.on('load', () => {
    initMapLayers();
    // 初始查询资源点
    queryResources();
  });

  // 地图移动结束后查询资源点
  map.on('moveend', debounce(() => {
    queryResources();
  }, 500)); // 防抖，500ms 后执行

  // 地图缩放结束后查询资源点
  map.on('zoomend', debounce(() => {
    queryResources();
  }, 500));
};

/**
 * 初始化地图图层
 */
const initMapLayers = () => {
  if (!map) return;

  // 添加资源点数据源
  map.addSource('resources', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
    cluster: true, // 启用聚合
    clusterMaxZoom: 14, // 聚合的最大缩放级别
    clusterRadius: 50, // 聚合半径 (像素)
  });

  // 获取数据源
  resourcesSource = map.getSource('resources') as mapboxgl.GeoJSONSource;

  // 添加聚合点图层
  clusterLayer = map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'resources',
    filter: ['has', 'point_count'],
    paint: {
      // 聚合点颜色根据数量变化
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#51bbd6', // 1-10 个
        10,
        '#f1f075', // 11-50 个
        50,
        '#f28cb1', // 51+ 个
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        10,
        30,
        50,
        40,
      ],
    },
  });

  // 添加聚合点数量标签图层
  clusterCountLayer = map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'resources',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#000000',
    },
  });

  // 添加单个资源点图层
  resourcesLayer = map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'resources',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'match',
        ['get', 'type'],
        'plant',
        '#38a169', // 植物 - 绿色
        'animal',
        '#e53e3e', // 动物 - 红色
        'mineral',
        '#d69e2e', // 矿产 - 金色
        'task',
        '#805ad5', // 任务 - 紫色
        '#718096', // 默认 - 灰色
      ],
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  });

  // 添加资源点点击事件
  map.on('click', 'unclustered-point', (e) => {
    if (!e.features || !e.features.length) return;

    const feature = e.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    const properties = feature.properties;

    // 确保坐标有效
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // 显示资源点信息弹窗
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
        <h3>${properties.name}</h3>
        <p><strong>类型:</strong> ${properties.type}</p>
        <p><strong>稀有度:</strong> ${properties.rarity}</p>
        <p><strong>等级:</strong> ${properties.level}</p>
        <p><strong>数量:</strong> ${properties.quantity}</p>
        ${properties.description ? `<p><strong>描述:</strong> ${properties.description}</p>` : ''}
      `)
      .addTo(map);
  });

  // 添加悬停效果
  map.on('mouseenter', 'unclustered-point', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'unclustered-point', () => {
    map.getCanvas().style.cursor = '';
  });
};

/**
 * 查询资源点数据并更新地图
 */
const queryResources = async () => {
  if (!map) return;

  // 获取当前地图可视区域
  const bounds = map.getBounds();
  mapStore.updateBounds({
    minLon: bounds.getWest(),
    maxLon: bounds.getEast(),
    minLat: bounds.getSouth(),
    maxLat: bounds.getNorth(),
  });

  // 查询资源点数据
  await mapStore.queryResources();

  // 更新地图数据源
  if (resourcesSource) {
    const geojsonFeatures = mapStore.resources.map((resource) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [resource.longitude, resource.latitude],
      },
      properties: {
        id: resource.id,
        name: resource.name,
        type: resource.type,
        rarity: resource.rarity,
        level: resource.level,
        quantity: resource.quantity,
        description: resource.description,
      },
    }));

    resourcesSource.setData({
      type: 'FeatureCollection',
      features: geojsonFeatures,
    });
  }
};

/**
 * 监听筛选条件变化，重新查询资源点
 */
watch(
  () => mapStore.filters,
  () => {
    queryResources();
  },
  { deep: true }
);

/**
 * 生命周期钩子 - 挂载
 */
onMounted(() => {
  initMap();
});

/**
 * 生命周期钩子 - 卸载
 */
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
  height: 100%;
}

.loading-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  z-index: 1000;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #51bbd6;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
