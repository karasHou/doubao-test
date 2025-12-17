<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1>仪表盘</h1>
      <p>欢迎使用权限系统</p>
    </div>
    
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #3498db;">
          👥
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ userCount }}</div>
          <div class="stat-label">用户总数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #2ecc71;">
          🎭
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ roleCount }}</div>
          <div class="stat-label">角色总数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #f39c12;">
          🔐
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ permissionCount }}</div>
          <div class="stat-label">权限总数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #e74c3c;">
          ⚖️
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ policyCount }}</div>
          <div class="stat-label">策略总数</div>
        </div>
      </div>
    </div>
    
    <div class="welcome-section">
      <h2>欢迎回来，{{ userInfo.nickname || userInfo.username }}！</h2>
      <p>这是您的个人仪表盘，显示了系统的关键统计信息。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const userCount = ref(0);
const roleCount = ref(0);
const permissionCount = ref(0);
const policyCount = ref(0);

// 用户信息
const userInfo = computed(() => ({
  username: authStore.user?.username || '',
  nickname: authStore.user?.nickname || '',
}));

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 这里应该调用 API 获取实际数据
    // 暂时使用模拟数据
    userCount.value = 50;
    roleCount.value = 10;
    permissionCount.value = 100;
    policyCount.value = 20;
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

onMounted(() => {
  loadStatistics();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 5px 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.welcome-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.welcome-section h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.welcome-section p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}
</style>
