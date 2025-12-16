<template>
  <div class="config-list">
    <el-card class="search-card">
      <el-form :inline="true" class="search-form" v-model="searchForm">
        <el-form-item label="应用ID">
          <el-input v-model="searchForm.app_id" placeholder="请输入应用ID" clearable></el-input>
        </el-form-item>
        <el-form-item label="命名空间">
          <el-input v-model="searchForm.namespace" placeholder="请输入命名空间" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadConfigs">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="showCreateDialog">新增配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="configs"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="app_id" label="应用ID" width="150" />
        <el-table-column prop="namespace" label="命名空间" width="150" />
        <el-table-column prop="key" label="配置键" min-width="180" />
        <el-table-column prop="value" label="配置值" min-width="200" show-overflow-tooltip />
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="is_active" label="启用状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.is_active" :active-value="true" :inactive-value="false" @change="onStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="gray_release" label="灰度发布" width="100">
          <template #default="{ row }">
            <el-tag type="success" v-if="row.gray_release">是</el-tag>
            <el-tag type="info" v-else>否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewConfig(row)">查看</el-button>
            <el-button size="small" @click="editConfig(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteConfig(row)">删除</el-button>
            <el-button size="small" @click="viewVersions(row)">版本</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        class="pagination"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 新增/编辑配置对话框 -->
    <el-dialog
      title="配置信息"
      v-model="dialogVisible"
      width="600px"
      @close="resetDialog"
    >
      <el-form
        ref="configForm"
        :model="formData"
        label-width="100px"
        :rules="formRules"
      >
        <el-form-item label="应用ID" prop="app_id">
          <el-input v-model="formData.app_id" placeholder="请输入应用ID" />
        </el-form-item>
        <el-form-item label="命名空间" prop="namespace">
          <el-input v-model="formData.namespace" placeholder="请输入命名空间" />
        </el-form-item>
        <el-form-item label="配置键" prop="key">
          <el-input v-model="formData.key" placeholder="请输入配置键" />
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input
            v-model="formData.value"
            placeholder="请输入配置值"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            placeholder="请输入配置描述"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="formData.is_active" />
        </el-form-item>
        <el-form-item label="灰度发布">
          <el-switch v-model="formData.gray_release" @change="onGrayReleaseChange" />
        </el-form-item>
        <el-form-item v-if="formData.gray_release" label="灰度规则">
          <el-input
            v-model="formData.gray_rules"
            placeholder="请输入灰度规则"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveConfig">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConfigList, createConfig, updateConfig, deleteConfig } from '../api/config'

const router = useRouter()

// 状态
const loading = ref(false)
const configs = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = ref({
  app_id: '',
  namespace: ''
})

// 对话框
const dialogVisible = ref(false)
const formData = ref({
  id: null,
  app_id: '',
  namespace: '',
  key: '',
  value: '',
  description: '',
  is_active: true,
  gray_release: false,
  gray_rules: ''
})

// 表单验证规则
const formRules = ref({
  app_id: [
    { required: true, message: '请输入应用ID', trigger: 'blur' }
  ],
  namespace: [
    { required: true, message: '请输入命名空间', trigger: 'blur' }
  ],
  key: [
    { required: true, message: '请输入配置键', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入配置值', trigger: 'blur' }
  ]
})

// 加载配置列表
const loadConfigs = async () => {
  loading.value = true
  try {
    const params = {
      app_id: searchForm.value.app_id,
      namespace: searchForm.value.namespace,
      page: currentPage.value,
      size: pageSize.value
    }
    const data = await getConfigList(params)
    configs.value = data
    total.value = data.length // 这里需要根据实际API返回的总数来设置
  } catch (error) {
    ElMessage.error('加载配置列表失败')
    console.error('加载配置列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    app_id: '',
    namespace: ''
  }
  currentPage.value = 1
  loadConfigs()
}

// 显示创建对话框
const showCreateDialog = () => {
  resetDialog()
  dialogVisible.value = true
}

// 编辑配置
const editConfig = (row) => {
  formData.value = { ...row }
  dialogVisible.value = true
}

// 查看配置
const viewConfig = (row) => {
  router.push(`/configs/${row.id}`)
}

// 查看版本历史
const viewVersions = (row) => {
  router.push(`/configs/${row.id}/versions`)
}

// 删除配置
const deleteConfig = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置项"${row.key}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteConfig(row.id)
    ElMessage.success('删除配置成功')
    loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除配置失败')
      console.error('删除配置失败:', error)
    }
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    if (formData.value.id) {
      // 编辑
      await updateConfig(formData.value.id, formData.value)
      ElMessage.success('更新配置成功')
    } else {
      // 新增
      await createConfig(formData.value)
      ElMessage.success('创建配置成功')
    }
    dialogVisible.value = false
    loadConfigs()
  } catch (error) {
    ElMessage.error('保存配置失败')
    console.error('保存配置失败:', error)
  }
}

// 重置对话框
const resetDialog = () => {
  formData.value = {
    id: null,
    app_id: '',
    namespace: '',
    key: '',
    value: '',
    description: '',
    is_active: true,
    gray_release: false,
    gray_rules: ''
  }
}

// 状态变化
const onStatusChange = async (row) => {
  try {
    await updateConfig(row.id, { ...row, is_active: row.is_active })
    ElMessage.success('更新状态成功')
  } catch (error) {
    row.is_active = !row.is_active // 回滚
    ElMessage.error('更新状态失败')
    console.error('更新状态失败:', error)
  }
}

// 灰度发布开关变化
const onGrayReleaseChange = () => {
  if (!formData.value.gray_release) {
    formData.value.gray_rules = ''
  }
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadConfigs()
}

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadConfigs()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化加载
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.config-list {
  padding: 10px 0;
}

.search-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>