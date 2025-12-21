<template>
  <div class="map-view">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import maplibregl from 'maplibre-gl'

export default {
  name: 'MapView',
  setup() {
    const store = useStore()
    const mapContainer = ref(null)
    const map = ref(null)
    const markers = ref([])

    onMounted(() => {
      if (!mapContainer.value) return

      map.value = new maplibregl.Map({
        container: mapContainer.value,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [store.getters['facilities/userLocation'].longitude, store.getters['facilities/userLocation'].latitude],
        zoom: 13
      })

      map.value.addControl(new maplibregl.NavigationControl())

      map.value.on('load', () => {
        updateMarkers()
      })

      watch(
        () => store.getters['facilities/filteredFacilities'],
        () => {
          updateMarkers()
        },
        { deep: true }
      )

      watch(
        () => store.getters['facilities/selectedFacility'],
        (newSelection, oldSelection) => {
          if (newSelection) {
            map.value.flyTo({
              center: [newSelection.longitude, newSelection.latitude],
              zoom: 15,
              duration: 1000
            })
          }
        }
      )
    })

    const updateMarkers = () => {
      if (!map.value) return

      markers.value.forEach(marker => marker.remove())
      markers.value = []

      const facilities = store.getters['facilities/filteredFacilities']
      facilities.forEach(facility => {
        const el = document.createElement('div')
        el.className = 'marker'
        el.innerHTML = `
          <div class="marker-icon">${getFacilityIcon(facility.type)}</div>
        `
        el.style.cursor = 'pointer'
        el.style.width = '40px'
        el.style.height = '40px'
        el.style.display = 'flex'
        el.style.alignItems = 'center'
        el.style.justifyContent = 'center'
        el.style.fontSize = '24px'

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([facility.longitude, facility.latitude])
          .addTo(map.value)

        marker.getElement().addEventListener('click', () => {
          store.dispatch('facilities/selectFacility', facility)
        })

        markers.value.push(marker)
      })
    }

    const getFacilityIcon = (type) => {
      const icons = {
        toilet: '🚻',
        hospital: '🏥',
        charging_station: '⚡'
      }
      return icons[type] || '📍'
    }

    onBeforeUnmount(() => {
      markers.value.forEach(marker => marker.remove())
    })

    return {
      mapContainer
    }
  }
}
</script>

<style scoped>
.map-view {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>
