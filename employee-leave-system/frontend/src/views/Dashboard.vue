<template>
  <div class="dashboard">
    <div class="card">
      <h2>系统概览</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalApplications }}</div>
          <div class="stat-label">总申请数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.pendingApplications }}</div>
          <div class="stat-label">待审批</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.approvedApplications }}</div>
          <div class="stat-label">已批准</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.rejectedApplications }}</div>
          <div class="stat-label">已驳回</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>快速操作</h2>
      <div class="quick-actions">
        <div class="action-card" @click="$router.push('/apply')">
          <div class="action-icon">📝</div>
          <div class="action-title">提交请假</div>
          <div class="action-desc">申请年假、病假、事假等</div>
        </div>
        <div class="action-card" @click="$router.push('/my-applications')">
          <div class="action-icon">📋</div>
          <div class="action-title">我的申请</div>
          <div class="action-desc">查看申请记录和状态</div>
        </div>
        <div class="action-card" @click="$router.push('/approvals')">
          <div class="action-icon">✅</div>
          <div class="action-title">审批任务</div>
          <div class="action-desc">处理待审批的请假申请</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>最近申请</h2>
      <div v-if="recentApplications.length > 0" class="recent-applications">
        <div
          v-for="application in recentApplications"
          :key="application.id"
          class="application-item"
          @click="$router.push(`/application/${application.id}`)"
        >
          <div class="application-info">
            <div class="application-id">#{{ application.application_id }}</div>
            <div class="application-dates">
              {{ formatDate(application.start_date) }} 至 {{ formatDate(application.end_date) }}
            </div>
          </div>
          <div class="application-meta">
            <span class="status-badge" :class="`status-${application.status}`">
              {{ getStatusText(application.status) }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="no-data">暂无申请记录</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { leaveApplicationAPI } from '../utils/api'

const stats = ref({
  totalApplications: 0,
  pendingApplications: 0,
  approvedApplications: 0,
  rejectedApplications: 0
})

const recentApplications = ref([])

const loadStats = async () => {
  try {
    const response = await leaveApplicationAPI.getAll()
    const applications = response.data || response

    stats.value.totalApplications = applications.length
    stats.value.pendingApplications = applications.filter(app => app.status === 'pending').length
    stats.value.approvedApplications = applications.filter(app => app.status === 'approved').length
    stats.value.rejectedApplications = applications.filter(app => app.status === 'rejected').length

    // 获取最近的 5 条申请
    recentApplications.value = applications.slice(0, 5)
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已驳回',
    withdrawn: '已撤回'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.action-card:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #4285f4;
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.action-desc {
  color: #666;
  font-size: 0.875rem;
}

.recent-applications {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.application-item:hover {
  background-color: #e9ecef;
  transform: translateX(4px);
}

.application-info {
  flex: 1;
}

.application-id {
  font-weight: 600;
  color: #4285f4;
  margin-bottom: 0.25rem;
}

.application-dates {
  color: #666;
  font-size: 0.875rem;
}

.application-meta {
  margin-left: 1rem;
}

.no-data {
  text-align: center;
  color: #666;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>
