<template>
  <div class="app-container">
    <header class="app-header">
      <h1>城市公共设施查询工具</h1>
      <p>查找您身边的厕所、医院和充电桩</p>
    </header>

    <div class="main-content">
      <aside class="sidebar">
        <FilterPanel />
        <FacilityList />
      </aside>

      <main class="map-container">
        <MapView />
      </main>
    </div>
  </div>
</template>

<script>
import FilterPanel from './components/FilterPanel.vue'
import FacilityList from './components/FacilityList.vue'
import MapView from './components/MapView.vue'

export default {
  name: 'App',
  components: {
    FilterPanel,
    FacilityList,
    MapView
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.app-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.app-header p {
  font-size: 0.875rem;
  opacity: 0.9;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 400px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-container {
  flex: 1;
  position: relative;
}
</style>
