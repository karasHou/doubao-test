<template>
  <div class="my-applications">
    <div class="card">
      <div class="flex-between mb-4">
        <h2>我的请假申请</h2>
        <select v-model="filter.status" class="filter-select" @change="loadApplications">
          <option value="">全部状态</option>
          <option value="pending">待审批</option>
          <option value="approved">已批准</option>
          <option value="rejected">已驳回</option>
          <option value="withdrawn">已撤回</option>
        </select>
      </div>

      <div v-if="applications.length > 0" class="applications-table">
        <table class="table">
          <thead>
            <tr>
              <th>申请编号</th>
              <th>申请人</th>
              <th>假期类型</th>
              <th>请假时间</th>
              <th>天数</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="application in applications" :key="application.id">
              <td>{{ application.application_id }}</td>
              <td>{{ getEmployeeName(application.employee_id) }}</td>
              <td>{{ getLeaveTypeName(application.leave_type_id) }}</td>
              <td>
                {{ formatDate(application.start_date) }} 至 {{ formatDate(application.end_date) }}
              </td>
              <td>{{ application.days }}</td>
              <td>
                <span class="status-badge" :class="`status-${application.status}`">
                  {{ getStatusText(application.status) }}
                </span>
              </td>
              <td>
                <button
                  class="btn btn-primary btn-sm"
                  @click="$router.push(`/application/${application.id}`)"
                >
                  查看详情
                </button>
                <button
                  v-if="application.status === 'pending'"
                  class="btn btn-secondary btn-sm"
                  @click="handleWithdraw(application.id)"
                >
                  撤回
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="no-data">
        <p>暂无请假申请记录</p>
        <button class="btn btn-primary mt-3" @click="$router.push('/apply')">
          立即申请
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { employeeAPI, leaveTypeAPI, leaveApplicationAPI } from '../utils/api'

const applications = ref([])
const employees = ref([])
const leaveTypes = ref([])
const isLoading = ref(false)

const filter = ref({
  status: ''
})

const loadApplications = async () => {
  isLoading.value = true
  try {
    const params = {}
    if (filter.value.status) {
      params.status = filter.value.status
    }
    const response = await leaveApplicationAPI.getAll(params)
    applications.value = response.data || response
  } catch (error) {
    console.error('Failed to load applications:', error)
  } finally {
    isLoading.value = false
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

const getEmployeeName = (employeeId) => {
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

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已驳回',
    withdrawn: '已撤回'
  }
  return statusMap[status] || status
}

const handleWithdraw = async (applicationId) => {
  if (confirm('确定要撤回该请假申请吗？')) {
    try {
      await leaveApplicationAPI.withdraw(applicationId)
      alert('申请已成功撤回')
      loadApplications()
    } catch (error) {
      console.error('Failed to withdraw application:', error)
      alert('撤回失败，请重试')
    }
  }
}

onMounted(() => {
  loadEmployees()
  loadLeaveTypes()
  loadApplications()
})
</script>

<style scoped>
.my-applications {
  max-width: 1200px;
  margin: 0 auto;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.applications-table {
  overflow-x: auto;
}

.no-data {
  text-align: center;
  color: #666;
  padding: 3rem;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  margin-right: 0.5rem;
}
</style>
