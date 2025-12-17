<template>
  <div id="app">
    <el-container style="height: 100vh;">
      <el-header>
        <h1>资产管理系统</h1>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
          >
            <el-menu-item index="1" @click="navigateTo('/')">
              <el-icon><House /></el-icon>
              <span>资产列表</span>
            </el-menu-item>
            <el-menu-item index="2" @click="navigateTo('/add')">
              <el-icon><Plus /></el-icon>
              <span>资产入库</span>
            </el-menu-item>
            <el-menu-item index="3" @click="navigateTo('/transfer')">
              <el-icon><ArrowRight /></el-icon>
              <span>资产领用</span>
            </el-menu-item>
            <el-menu-item index="4" @click="navigateTo('/return')">
              <el-icon><ArrowLeft /></el-icon>
              <span>资产归还</span>
            </el-menu-item>
            <el-menu-item index="5" @click="navigateTo('/report')">
              <el-icon><Document /></el-icon>
              <span>报表导出</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { House, Plus, ArrowRight, ArrowLeft, Document } from '@element-plus/icons-vue'

const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.el-header {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
  padding-left: 20px;
}

.el-header h1 {
  margin: 0;
  font-size: 20px;
}

.el-aside {
  background-color: #f0f2f5;
}

.el-main {
  padding: 20px;
}
</style>