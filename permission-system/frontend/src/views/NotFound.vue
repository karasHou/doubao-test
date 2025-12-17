<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="not-found-code">404</h1>
      <h2 class="not-found-title">页面未找到</h2>
      <p class="not-found-message">抱歉，您访问的页面不存在或已被移动。</p>
      <div class="not-found-actions">
        <button class="btn btn-primary" @click="goBack">
          返回上一页
        </button>
        <button class="btn btn-secondary" @click="goHome">
          回到首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    router.push('/');
  }
};

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 400px;
}

.not-found-code {
  margin: 0 0 10px 0;
  font-size: 72px;
  font-weight: 700;
  color: #6c757d;
}

.not-found-title {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.not-found-message {
  margin: 0 0 30px 0;
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
  min-width: 120px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>
