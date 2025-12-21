import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export default {
  namespaced: true,
  state: {
    facilities: [],
    selectedFacility: null,
    loading: false,
    filters: {
      type: '',
      rating: '',
      sort: 'distance'
    },
    userLocation: {
      latitude: 31.2304,
      longitude: 121.4737
    }
  },
  mutations: {
    SET_FACILITIES(state, facilities) {
      state.facilities = facilities
    },
    SET_SELECTED_FACILITY(state, facility) {
      state.selectedFacility = facility
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
    },
    SET_USER_LOCATION(state, location) {
      state.userLocation = location
    }
  },
  actions: {
    async fetchFacilities({ commit, state }) {
      commit('SET_LOADING', true)
      try {
        const params = new URLSearchParams()
        if (state.filters.type) params.append('type', state.filters.type)
        if (state.filters.rating) params.append('rating', state.filters.rating)
        if (state.filters.sort) params.append('sort', state.filters.sort)
        params.append('latitude', state.userLocation.latitude)
        params.append('longitude', state.userLocation.longitude)

        const response = await axios.get(`${API_BASE_URL}/facilities?${params}`)
        if (response.data.success) {
          commit('SET_FACILITIES', response.data.data)
        }
      } catch (error) {
        console.error('Error fetching facilities:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    selectFacility({ commit }, facility) {
      commit('SET_SELECTED_FACILITY', facility)
    },
    updateFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', filters)
      dispatch('fetchFacilities')
    },
    updateUserLocation({ commit, dispatch }, location) {
      commit('SET_USER_LOCATION', location)
      dispatch('fetchFacilities')
    }
  },
  getters: {
    filteredFacilities: (state) => state.facilities,
    selectedFacility: (state) => state.selectedFacility,
    loading: (state) => state.loading,
    filters: (state) => state.filters,
    userLocation: (state) => state.userLocation
  }
}
