<template>
  <div class="forbidden-container">
    <div class="forbidden-content">
      <h1 class="forbidden-code">403</h1>
      <h2 class="forbidden-title">禁止访问</h2>
      <p class="forbidden-message">抱歉，您没有权限访问此页面。</p>
      <div class="forbidden-actions">
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
.forbidden-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.forbidden-content {
  text-align: center;
  max-width: 400px;
}

.forbidden-code {
  margin: 0 0 10px 0;
  font-size: 72px;
  font-weight: 700;
  color: #dc3545;
}

.forbidden-title {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.forbidden-message {
  margin: 0 0 30px 0;
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.forbidden-actions {
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
