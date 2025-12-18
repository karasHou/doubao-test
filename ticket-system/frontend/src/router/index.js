import { createRouter, createWebHistory } from 'vue-router';
import TicketList from '../pages/TicketList.vue';
import TicketDetail from '../pages/TicketDetail.vue';
import CreateTicket from '../pages/CreateTicket.vue';
import Login from '../pages/Login.vue';

const routes = [
  {
    path: '/',
    redirect: '/tickets',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/tickets',
    name: 'TicketList',
    component: TicketList,
  },
  {
    path: '/tickets/create',
    name: 'CreateTicket',
    component: CreateTicket,
  },
  {
    path: '/tickets/:id',
    name: 'TicketDetail',
    component: TicketDetail,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
