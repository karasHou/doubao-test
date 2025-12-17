<template>
  <div class="application-detail">
    <div class="card">
      <div class="flex-between mb-4">
        <h2>申请详情</h2>
        <button class="btn btn-primary" @click="$router.go(-1)">
          返回
        </button>
      </div>

      <div v-if="application" class="detail-content">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>申请编号</label>
              <span>{{ application.application_id }}</span>
            </div>
            <div class="info-item">
              <label>申请人</label>
              <span>{{ getEmployeeName(application.employee_id) }}</span>
            </div>
            <div class="info-item">
              <label>假期类型</label>
              <span>{{ getLeaveTypeName(application.leave_type_id) }}</span>
            </div>
            <div class="info-item">
              <label>开始日期</label>
              <span>{{ formatDate(application.start_date) }}</span>
            </div>
            <div class="info-item">
              <label>结束日期</label>
              <span>{{ formatDate(application.end_date) }}</span>
            </div>
            <div class="info-item">
              <label>请假天数</label>
              <span>{{ application.days }} 天</span>
            </div>
            <div class="info-item">
              <label>当前状态</label>
              <span class="status-badge" :class="`status-${application.status}`">
                {{ getStatusText(application.status) }}
              </span>
            </div>
            <div class="info-item">
              <label>当前审批人</label>
              <span>{{ getEmployeeName(application.current_approver_id) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>请假原因</h3>
          <div class="reason-content">
            {{ application.reason || '无' }}
          </div>
        </div>

        <div class="detail-section">
          <h3>审批历史</h3>
          <div v-if="approvalHistory.length > 0" class="approval-history">
            <div
              v-for="(record, index) in approvalHistory"
              :key="record.id"
              class="approval-record"
            >
              <div class="record-header">
                <div class="record-step">第 {{ index + 1 }} 步</div>
                <span
                  class="status-badge"
                  :class="record.action === 'approved' ? 'status-approved' : 'status-rejected'"
                >
                  {{ record.action === 'approved' ? '已批准' : '已驳回' }}
                </span>
              </div>
              <div class="record-content">
                <div>
                  <strong>审批人：</strong>
                  {{ record.approver_name || getEmployeeName(record.approver_id) }}
                </div>
                <div v-if="record.approved_at">
                  <strong>审批时间：</strong>
                  {{ formatDateTime(record.approved_at) }}
                </div>
                <div v-if="record.comment" class="record-comment">
                  <strong>审批意见：</strong>
                  {{ record.comment }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-history">暂无审批记录</div>
        </div>
      </div>

      <div v-else class="loading">加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { employeeAPI, leaveTypeAPI, leaveApplicationAPI, approvalAPI } from '../utils/api'

const route = useRoute()

const application = ref(null)
const employees = ref([])
const leaveTypes = ref([])
const approvalHistory = ref([])
const isLoading = ref(true)

const loadApplication = async (id) => {
  try {
    const response = await leaveApplicationAPI.getById(id)
    application.value = response.data || response
  } catch (error) {
    console.error('Failed to load application:', error)
  }
}

const loadEmployees = async () => {
  try {
    const response = await employeeAPI.getAll()
    employees.value = response.data || response
  } catch (error) {
    console.error('Failed to load employees:', error)
  }
}

const loadLeaveTypes = async () => {
  try {
    const response = await leaveTypeAPI.getAll()
    leaveTypes.value = response.data || response
  } catch (error) {
    console.error('Failed to load leave types:', error)
  }
}

const loadApprovalHistory = async (id) => {
  try {
    const response = await approvalAPI.getHistory(id)
    approvalHistory.value = response.data || response
  } catch (error) {
    console.error('Failed to load approval history:', error)
  }
}

const getEmployeeName = (employeeId) => {
  if (!employeeId) return '无'
  const employee = employees.value.find(emp => emp.id === employeeId)
  return employee ? employee.name : '未知'
}

const getLeaveTypeName = (leaveTypeId) => {
  const leaveType = leaveTypes.value.find(lt => lt.id === leaveTypeId)
  return leaveType ? leaveType.name : '未知'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
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

onMounted(async () => {
  await Promise.all([
    loadEmployees(),
    loadLeaveTypes()
  ])

  const id = route.params.id
  if (id) {
    await Promise.all([
      loadApplication(id),
      loadApprovalHistory(id)
    ])
  }

  isLoading.value = false
})

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      isLoading.value = true
      await Promise.all([
        loadApplication(newId),
        loadApprovalHistory(newId)
      ])
      isLoading.value = false
    }
  }
)
</script>

<style scoped>
.application-detail {
  max-width: 800px;
  margin: 0 auto;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.detail-section h3 {
  margin-bottom: 1.5rem;
  color: #4285f4;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
}

.info-item span {
  color: #333;
}

.reason-content {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  color: #333;
  line-height: 1.6;
}

.approval-history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.approval-record {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #4285f4;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.record-step {
  font-weight: 600;
  color: #4285f4;
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #333;
}

.record-comment {
  color: #666;
  font-style: italic;
  padding: 0.5rem 0;
}

.no-history {
  text-align: center;
  color: #666;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
}

.loading {
  text-align: center;
  color: #666;
  padding: 3rem;
}
</style>
