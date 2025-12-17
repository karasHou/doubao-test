<template>
  <div class="asset-transfer">
    <el-card>
      <h2>资产领用</h2>

      <!-- 资产搜索 -->
      <div class="search-section">
        <el-input
          v-model="searchText"
          placeholder="搜索资产编号或名称"
          style="width: 300px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button
          type="primary"
          @click="showTransferDialog"
          :disabled="!selectedAsset"
        >
          办理领用
        </el-button>
      </div>

      <!-- 资产列表 -->
      <el-table
        :data="availableAssets"
        border
        stripe
        style="width: 100%; margin-top: 20px;"
        @row-click="handleRowClick"
        row-key="id"
        :highlight-current-row="true"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="asset_number"
          label="资产编号"
          width="150"
        />
        <el-table-column
          prop="name"
          label="资产名称"
          min-width="150"
        />
        <el-table-column
          prop="category"
          label="分类"
          width="120"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="100"
        >
          <template #default="scope">
            <el-tag type="success">库存中</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          width="120"
          formatter="formatPrice"
        />
      </el-table>

      <!-- 领用对话框 -->
      <el-dialog
        v-model="transferDialogVisible"
        title="资产领用"
        width="500px"
      >
        <el-form
          ref="transferFormRef"
          :model="transferForm"
          label-width="100px"
        >
          <el-form-item
            label="资产名称"
            prop="asset_name"
          >
            <el-input
              v-model="transferForm.asset_name"
              disabled
            />
          </el-form-item>

          <el-form-item
            label="领用人员"
            prop="user"
            :rules="[{ required: true, message: '请输入领用人员', trigger: 'blur' }]"
          >
            <el-input
              v-model="transferForm.user"
              placeholder="请输入领用人员姓名"
            />
          </el-form-item>

          <el-form-item
            label="部门"
            prop="department"
            :rules="[{ required: true, message: '请输入部门', trigger: 'blur' }]"
          >
            <el-input
              v-model="transferForm.department"
              placeholder="请输入部门名称"
            />
          </el-form-item>

          <el-form-item
            label="领用日期"
            prop="transfer_date"
            :rules="[{ required: true, message: '请选择领用日期', trigger: 'change' }]"
          >
            <el-date-picker
              v-model="transferForm.transfer_date"
              type="date"
              placeholder="请选择领用日期"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item
            label="领用原因"
            prop="reason"
          >
            <el-input
              v-model="transferForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入领用原因"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="transferDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="handleTransferSubmit"
              :loading="transferLoading"
            >
              确认领用
            </el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { assetAPI } from '../utils/api'

const searchText = ref('')
const availableAssets = ref([])
const selectedAsset = ref(null)
const transferDialogVisible = ref(false)
const transferFormRef = ref()
const transferLoading = ref(false)
const transferForm = ref({
  asset_name: '',
  user: '',
  department: '',
  transfer_date: '',
  reason: ''
})

// 获取可用资产列表（库存中）
const fetchAvailableAssets = async () => {
  try {
    const params = {
      status: 'in_stock',
      search: searchText.value
    }
    const response = await assetAPI.getAssets(params)
    availableAssets.value = response.data
  } catch (error) {
    ElMessage.error('获取可用资产列表失败')
    console.error(error)
  }
}

// 搜索
const handleSearch = () => {
  fetchAvailableAssets()
}

// 行点击
const handleRowClick = (row) => {
  selectedAsset.value = row
}

// 显示领用对话框
const showTransferDialog = () => {
  if (!selectedAsset.value) {
    ElMessage.warning('请选择要领用的资产')
    return
  }

  transferForm.value.asset_name = selectedAsset.value.name
  transferForm.value.transfer_date = new Date()
  transferDialogVisible.value = true
}

// 提交领用
const handleTransferSubmit = async () => {
  try {
    await transferFormRef.value.validate()
    transferLoading.value = true

    const data = {
      user: transferForm.value.user,
      department: transferForm.value.department,
      transfer_date: transferForm.value.transfer_date ?
        transferForm.value.transfer_date.toISOString().split('T')[0] : '',
      reason: transferForm.value.reason
    }

    await assetAPI.transferAsset(selectedAsset.value.id, data)
    ElMessage.success('资产领用成功')

    transferDialogVisible.value = false
    selectedAsset.value = null
    fetchAvailableAssets()
  } catch (error) {
    ElMessage.error('资产领用失败')
    console.error(error)
  } finally {
    transferLoading.value = false
  }
}

// 格式化价格
const formatPrice = (row, column, cellValue) => {
  return `¥${cellValue}`
}

// 挂载时获取可用资产列表
onMounted(() => {
  fetchAvailableAssets()
})
</script>

<style scoped>
.asset-transfer {
  padding: 0;
}

.asset-transfer h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.search-section {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}
</style>