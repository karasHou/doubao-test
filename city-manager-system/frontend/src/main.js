import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import './styles/main.css'
import 'maplibre-gl/dist/maplibre-gl.css'

import facilitiesModule from './store/modules/facilities'

const store = createStore({
  modules: {
    facilities: facilitiesModule
  }
})

const app = createApp(App)
app.use(store)
app.mount('#app')
