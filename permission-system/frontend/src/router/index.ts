import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { PermissionService } from '../utils/permission';

// 公共路由
const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/Forbidden.vue'),
    meta: { title: '无权限访问' },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面不存在' },
  },
];

// 受保护的路由
const protectedRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('../layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', requiresAuth: true, permission: 'dashboard:view' },
      },
      {
        path: '/users',
        name: 'UserManagement',
        component: () => import('../views/UserManagement.vue'),
        meta: { title: '用户管理', requiresAuth: true, permission: 'user:manage' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [...publicRoutes, ...protectedRoutes],
});

// 路由守卫
router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();
  const permissionService = new PermissionService();

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 权限系统` : '权限系统';

  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some(route => route.path === to.path);
  
  if (isPublicRoute) {
    // 如果是登录页且已登录，重定向到首页
    if (to.path === '/login' && authStore.isAuthenticated) {
      next('/');
      return;
    }
    next();
    return;
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  // 检查权限
  if (to.meta.permission && !permissionService.hasPermission(to.meta.permission as string)) {
    next('/403');
    return;
  }

  next();
});

export default router;
