import { createRouter, createWebHistory } from 'vue-router'
import ConfigList from '../views/ConfigList.vue'
import ConfigDetail from '../views/ConfigDetail.vue'
import ConfigVersion from '../views/ConfigVersion.vue'

const routes = [
  {
    path: '/',
    name: 'ConfigList',
    component: ConfigList
  },
  {
    path: '/configs/:id',
    name: 'ConfigDetail',
    component: ConfigDetail,
    props: true
  },
  {
    path: '/configs/:config_id/versions',
    name: 'ConfigVersion',
    component: ConfigVersion,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router