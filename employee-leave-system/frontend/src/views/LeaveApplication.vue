<template>
  <div class="leave-application">
    <div class="card">
      <h2>提交请假申请</h2>
      <form @submit.prevent="handleSubmit" class="leave-form">
        <div class="form-group">
          <label for="employee_id">申请人</label>
          <select id="employee_id" v-model="formData.employee_id" required>
            <option value="">请选择申请人</option>
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">
              {{ employee.name }} ({{ employee.employee_id }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="leave_type_id">假期类型</label>
          <select id="leave_type_id" v-model="formData.leave_type_id" required>
            <option value="">请选择假期类型</option>
            <option v-for="leaveType in leaveTypes" :key="leaveType.id" :value="leaveType.id">
              {{ leaveType.name }}
            </option>
          </select>
        </div>

        <div class="flex gap-4">
          <div class="form-group flex-1">
            <label for="start_date">开始日期</label>
            <input id="start_date" type="date" v-model="formData.start_date" required>
          </div>
          <div class="form-group flex-1">
            <label for="end_date">结束日期</label>
            <input id="end_date" type="date" v-model="formData.end_date" required>
          </div>
        </div>

        <div class="form-group">
          <label for="days">请假天数</label>
          <input id="days" type="number" v-model.number="formData.days" min="0.5" step="0.5" required>
        </div>

        <div class="form-group">
          <label for="reason">请假原因</label>
          <textarea id="reason" v-model="formData.reason" rows="4" required></textarea>
        </div>

        <div class="form-actions flex justify-end gap-2">
          <button type="button" class="btn btn-secondary" @click="resetForm">
            重置
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : '提交申请' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { employeeAPI, leaveTypeAPI, leaveApplicationAPI } from '../utils/api'

const router = useRouter()

const employees = ref([])
const leaveTypes = ref([])
const isSubmitting = ref(false)

const formData = ref({
  employee_id: '',
  leave_type_id: '',
  start_date: '',
  end_date: '',
  days: 0,
  reason: ''
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

const handleSubmit = async () => {
  // 验证日期
  if (new Date(formData.value.start_date) > new Date(formData.value.end_date)) {
    alert('开始日期不能晚于结束日期')
    return
  }

  isSubmitting.value = true

  try {
    await leaveApplicationAPI.create(formData.value)
    alert('请假申请提交成功！')
    resetForm()
    router.push('/my-applications')
  } catch (error) {
    console.error('Failed to submit leave application:', error)
    alert('提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    days: 0,
    reason: ''
  }
}

onMounted(() => {
  loadEmployees()
  loadLeaveTypes()
})
</script>

<style scoped>
.leave-application {
  max-width: 600px;
  margin: 0 auto;
}

.leave-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.flex {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.justify-end {
  justify-content: flex-end;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}
</style>
