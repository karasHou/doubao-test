import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';

// 创建 Pinia 实例
const pinia = createPinia();

// 创建应用实例
const app = createApp(App);

// 安装 Pinia 插件
app.use(pinia);

// 挂载应用
app.mount('#app');
