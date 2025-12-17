import { createRouter, createWebHistory } from 'vue-router'
import AssetList from '../views/AssetList.vue'
import AssetAdd from '../views/AssetAdd.vue'
import AssetTransfer from '../views/AssetTransfer.vue'
import AssetReturn from '../views/AssetReturn.vue'
import ReportExport from '../views/ReportExport.vue'

const routes = [
  {
    path: '/',
    name: 'AssetList',
    component: AssetList
  },
  {
    path: '/add',
    name: 'AssetAdd',
    component: AssetAdd
  },
  {
    path: '/transfer',
    name: 'AssetTransfer',
    component: AssetTransfer
  },
  {
    path: '/return',
    name: 'AssetReturn',
    component: AssetReturn
  },
  {
    path: '/report',
    name: 'ReportExport',
    component: ReportExport
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router