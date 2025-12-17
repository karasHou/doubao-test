import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import { useAuthStore } from './store/auth';
import installPermissionDirective from './directives/permission';
import './style.css';
import App from './App.vue';

// 创建应用实例
const app = createApp(App);

// 安装 Pinia 状态管理
const pinia = createPinia();
app.use(pinia);

// 安装路由
app.use(router);

// 安装权限指令
installPermissionDirective(app);

// 从本地存储恢复认证状态
const authStore = useAuthStore();
authStore.restoreAuthState();

// 挂载应用
app.mount('#app');
