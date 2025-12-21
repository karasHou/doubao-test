<template>
  <div id="app">
    <el-container style="height: 100vh;">
      <el-header>
        <h1>二手物品管理工具</h1>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
            @select="handleMenuSelect"
          >
            <el-menu-item index="1">
              <el-icon><ShoppingCart /></el-icon>
              <span>物品列表</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><Plus /></el-icon>
              <span>添加物品</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <ItemList v-if="activeMenu === '1'" />
          <ItemForm v-else />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ShoppingCart, Plus } from '@element-plus/icons-vue'
import ItemList from './components/ItemList.vue'
import ItemForm from './components/ItemForm.vue'

const activeMenu = ref('1')

const handleMenuSelect = (index) => {
  activeMenu.value = index
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.el-header {
  background-color: #2385bb;
  color: white;
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.el-menu-vertical-demo {
  height: 100%;
}
</style>