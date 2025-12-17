<template>
  <div class="asset-return">
    <el-card>
      <h2>资产归还</h2>

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
          @click="showReturnDialog"
          :disabled="!selectedAsset"
        >
          办理归还
        </el-button>
      </div>

      <!-- 资产列表 -->
      <el-table
        :data="inUseAssets"
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
          prop="user"
          label="使用人"
          width="120"
        />
        <el-table-column
          prop="department"
          label="部门"
          width="120"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="100"
        >
          <template #default="scope">
            <el-tag type="primary">使用中</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 归还对话框 -->
      <el-dialog
        v-model="returnDialogVisible"
        title="资产归还"
        width="500px"
      >
        <el-form
          ref="returnFormRef"
          :model="returnForm"
          label-width="100px"
        >
          <el-form-item
            label="资产名称"
            prop="asset_name"
          >
            <el-input
              v-model="returnForm.asset_name"
              disabled
            />
          </el-form-item>

          <el-form-item
            label="使用人员"
            prop="user"
          >
            <el-input
              v-model="returnForm.user"
              disabled
            />
          </el-form-item>

          <el-form-item
            label="归还日期"
            prop="return_date"
            :rules="[{ required: true, message: '请选择归还日期', trigger: 'change' }]"
          >
            <el-date-picker
              v-model="returnForm.return_date"
              type="date"
              placeholder="请选择归还日期"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item
            label="归还状态"
            prop="condition"
            :rules="[{ required: true, message: '请选择归还状态', trigger: 'change' }]"
          >
            <el-select
              v-model="returnForm.condition"
              placeholder="请选择归还状态"
              style="width: 100%;"
            >
              <el-option label="完好无损" value="good" />
              <el-option label="轻微损坏" value="minor_damage" />
              <el-option label="严重损坏" value="major_damage" />
              <el-option label="无法使用" value="unusable" />
            </el-select>
          </el-form-item>

          <el-form-item
            label="备注"
            prop="notes"
          >
            <el-input
              v-model="returnForm.notes"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="returnDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="handleReturnSubmit"
              :loading="returnLoading"
            >
              确认归还
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
const inUseAssets = ref([])
const selectedAsset = ref(null)
const returnDialogVisible = ref(false)
const returnFormRef = ref()
const returnLoading = ref(false)
const returnForm = ref({
  asset_name: '',
  user: '',
  return_date: '',
  condition: '',
  notes: ''
})

// 获取使用中资产列表
const fetchInUseAssets = async () => {
  try {
    const params = {
      status: 'in_use',
      search: searchText.value
    }
    const response = await assetAPI.getAssets(params)
    inUseAssets.value = response.data
  } catch (error) {
    ElMessage.error('获取使用中资产列表失败')
    console.error(error)
  }
}

// 搜索
const handleSearch = () => {
  fetchInUseAssets()
}

// 行点击
const handleRowClick = (row) => {
  selectedAsset.value = row
}

// 显示归还对话框
const showReturnDialog = () => {
  if (!selectedAsset.value) {
    ElMessage.warning('请选择要归还的资产')
    return
  }

  returnForm.value.asset_name = selectedAsset.value.name
  returnForm.value.user = selectedAsset.value.user
  returnForm.value.return_date = new Date()
  returnDialogVisible.value = true
}

// 提交归还
const handleReturnSubmit = async () => {
  try {
    await returnFormRef.value.validate()
    returnLoading.value = true

    const data = {
      return_date: returnForm.value.return_date ?
        returnForm.value.return_date.toISOString().split('T')[0] : '',
      condition: returnForm.value.condition,
      notes: returnForm.value.notes
    }

    await assetAPI.returnAsset(selectedAsset.value.id, data)
    ElMessage.success('资产归还成功')

    returnDialogVisible.value = false
    selectedAsset.value = null
    fetchInUseAssets()
  } catch (error) {
    ElMessage.error('资产归还失败')
    console.error(error)
  } finally {
    returnLoading.value = false
  }
}

// 挂载时获取使用中资产列表
onMounted(() => {
  fetchInUseAssets()
})
</script>

<style scoped>
.asset-return {
  padding: 0;
}

.asset-return h2 {
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