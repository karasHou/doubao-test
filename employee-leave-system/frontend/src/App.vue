<template>
  <div class="app">
    <header class="header">
      <div class="container">
        <h1>员工请假审批系统</h1>
        <nav class="nav">
          <router-link to="/" class="nav-link" active-class="active">
            首页
          </router-link>
          <router-link to="/apply" class="nav-link" active-class="active">
            请假申请
          </router-link>
          <router-link to="/my-applications" class="nav-link" active-class="active">
            我的申请
          </router-link>
          <router-link to="/approvals" class="nav-link" active-class="active">
            审批任务
          </router-link>
        </nav>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  padding: 2rem 0;
}
</style>
