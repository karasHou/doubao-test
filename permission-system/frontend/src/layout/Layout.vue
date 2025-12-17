<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>权限系统</h2>
      </div>
      <nav class="sidebar-menu">
        <router-link 
          v-for="menu in menuItems" 
          :key="menu.name" 
          :to="menu.path"
          :class="['menu-item', { active: $route.path === menu.path }]"
        >
          <span class="menu-icon" v-if="menu.icon">{{ menu.icon }}</span>
          <span class="menu-text">{{ menu.text }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-button" @click="handleLogout">
          <span>退出登录</span>
        </button>
      </div>
    </aside>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="main-header">
        <div class="header-left">
          <button class="menu-toggle" @click="toggleSidebar">
            ☰
          </button>
        </div>
        <div class="header-right">
          <div class="user-info">
            <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="用户头像" class="user-avatar">
            <span v-else class="user-avatar-placeholder">{{ userInfo.nickname?.[0] || userInfo.username?.[0] }}</span>
            <span class="user-name">{{ userInfo.nickname || userInfo.username }}</span>
          </div>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { PermissionService } from '../utils/permission';

const router = useRouter();
const authStore = useAuthStore();
const isSidebarOpen = ref(true);

// 用户信息
const userInfo = computed(() => ({
  username: authStore.user?.username || '',
  nickname: authStore.user?.nickname || '',
  avatar: authStore.user?.avatar || '',
}));

// 菜单项（根据权限动态生成）
const menuItems = computed(() => {
  const items = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      text: '仪表盘',
      icon: '📊',
      permission: 'dashboard:view',
    },
    {
      name: 'UserManagement',
      path: '/users',
      text: '用户管理',
      icon: '👥',
      permission: 'user:manage',
    },
  ];
  
  // 根据权限过滤菜单项
  return items.filter(item => {
    if (!item.permission) return true;
    const permissionService = new PermissionService();
    return permissionService.hasPermission(item.permission);
  });
});

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// 处理退出登录
const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #34495e;
  text-align: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #34495e;
}

.menu-item.active {
  background-color: #3498db;
}

.menu-icon {
  margin-right: 10px;
  font-size: 18px;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 10px;
  border-top: 1px solid #34495e;
}

.logout-button {
  width: 100%;
  padding: 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.logout-button:hover {
  background-color: #c0392b;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ecf0f1;
}

.main-header {
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.menu-toggle {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  padding: 5px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 16px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>
