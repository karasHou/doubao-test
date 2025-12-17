import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import LeaveApplication from '../views/LeaveApplication.vue'
import MyApplications from '../views/MyApplications.vue'
import ApprovalTasks from '../views/ApprovalTasks.vue'
import ApplicationDetail from '../views/ApplicationDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/apply',
    name: 'LeaveApplication',
    component: LeaveApplication
  },
  {
    path: '/my-applications',
    name: 'MyApplications',
    component: MyApplications
  },
  {
    path: '/approvals',
    name: 'ApprovalTasks',
    component: ApprovalTasks
  },
  {
    path: '/application/:id',
    name: 'ApplicationDetail',
    component: ApplicationDetail,
    props: true
  }
]

export default routes
