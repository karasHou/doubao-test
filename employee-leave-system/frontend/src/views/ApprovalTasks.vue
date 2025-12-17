<template>
  <div class="approval-tasks">
    <div class="card">
      <h2>审批任务</h2>

      <div class="form-group mb-4">
        <label for="approver_id">审批人</label>
        <select id="approver_id" v-model="selectedApprover" required @change="loadApprovalTasks">
          <option value="">请选择审批人</option>
          <option v-for="employee in employees" :key="employee.id" :value="employee.id">
            {{ employee.name }}
          </option>
        </select>
      </div>

      <div v-if="approvalTasks.length > 0" class="approval-tasks-list">
        <div
          v-for="task in approvalTasks"
          :key="task.id"
          class="approval-task-card"
        >
          <div class="task-header">
            <div class="task-id">申请编号：{{ task.application_id }}</div>
            <span class="status-badge status-pending">待审批</span>
          </div>
          <div class="task-content">
            <div class="task-info">
              <div>
                <strong>申请人：</strong>
                {{ getEmployeeName(task.employee_id) }}
              </div>
              <div>
                <strong>假期类型：</strong>
                {{ getLeaveTypeName(task.leave_type_id) }}
              </div>
              <div>
                <strong>请假时间：</strong>
                {{ formatDate(task.start_date) }} 至 {{ formatDate(task.end_date) }}
              </div>
              <div>
                <strong>天数：</strong>
                {{ task.days }} 天
              </div>
              <div v-if="task.reason" class="task-reason">
                <strong>请假原因：</strong>
                {{ task.reason }}
              </div>
            </div>
            <div class="task-actions">
              <button
                class="btn btn-success btn-block"
                @click="showApprovalModal(task, 'approved')"
              >
                批准
              </button>
              <button
                class="btn btn-danger btn-block"
                @click="showApprovalModal(task, 'rejected')"
              >
                驳回
              </button>
              <button
                class="btn btn-primary btn-block"
                @click="$router.push(`/application/${task.id}`)"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-tasks">
        <p v-if="selectedApprover">暂无待审批的请假申请</p>
        <p v-else>请选择审批人查看待审批任务</p>
      </div>
    </div>

    <!-- 审批模态框 -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h3>
          {{ modalData.action === 'approved' ? '批准' : '驳回' }}
          申请 #{{ modalData.application?.application_id }}
        </h3>
        <div class="form-group">
          <label for="comment">审批意见（可选）</label>
          <textarea
            id="comment"
            v-model="modalData.comment"
            rows="4"
            placeholder="请输入审批意见..."
          ></textarea>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="btn btn-secondary" @click="closeModal">
            取消
          </button>
          <button
            class="btn"
            :class="modalData.action === 'approved' ? 'btn-success' : 'btn-danger'"
            @click="submitApproval"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '处理中...' : '确认' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { employeeAPI, leaveTypeAPI, approvalAPI } from '../utils/api'

const router = useRouter()

const employees = ref([])
const leaveTypes = ref([])
const approvalTasks = ref([])
const selectedApprover = ref('')
const showModal = ref(false)
const isSubmitting = ref(false)

const modalData = ref({
  application: null,
  action: '',
  comment: ''
})

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

const loadApprovalTasks = async () => {
  if (!selectedApprover.value) {
    approvalTasks.value = []
    return
  }

  try {
    const response = await approvalAPI.getMyPending(selectedApprover.value)
    approvalTasks.value = response.data || response
  } catch (error) {
    console.error('Failed to load approval tasks:', error)
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

const showApprovalModal = (application, action) => {
  modalData.value = {
    application: application,
    action: action,
    comment: ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  modalData.value = {
    application: null,
    action: '',
    comment: ''
  }
}

const submitApproval = async () => {
  isSubmitting.value = true

  try {
    await approvalAPI.approve(modalData.value.application.id, {
      approver_id: selectedApprover.value,
      action: modalData.value.action,
      comment: modalData.value.comment
    })

    alert(
      modalData.value.action === 'approved'
        ? '申请已批准'
        : '申请已驳回'
    )

    closeModal()
    loadApprovalTasks()
  } catch (error) {
    console.error('Failed to submit approval:', error)
    alert('审批失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadEmployees()
  loadLeaveTypes()
})
</script>

<style scoped>
.approval-tasks {
  max-width: 1000px;
  margin: 0 auto;
}

.approval-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.approval-task-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.3s;
}

.approval-task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.task-id {
  font-weight: 600;
  color: #4285f4;
}

.task-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-reason {
  color: #666;
  font-style: italic;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 120px;
}

.btn-block {
  width: 100%;
}

.no-tasks {
  text-align: center;
  color: #666;
  padding: 3rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-bottom: 1.5rem;
  color: #4285f4;
}
</style>
