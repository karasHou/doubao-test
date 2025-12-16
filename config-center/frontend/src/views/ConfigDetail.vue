<template>
  <div class="config-detail">
    <el-card>
      <div slot="header" class="card-header">
        <el-button type="primary" size="small" @click="goBack">返回列表</el-button>
        <span style="margin-left: 10px; font-size: 16px; font-weight: 600;">配置详情</span>
      </div>

      <el-descriptions :column="2" border size="small" :label-width="150">
        <el-descriptions-item label="ID">{{ config.id }}</el-descriptions-item>
        <el-descriptions-item label="应用ID">{{ config.app_id }}</el-descriptions-item>
        <el-descriptions-item label="命名空间">{{ config.namespace }}</el-descriptions-item>
        <el-descriptions-item label="配置键">{{ config.key }}</el-descriptions-item>
        <el-descriptions-item label="配置值" :span="2">
          <div class="config-value">{{ config.value }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="版本">{{ config.version }}</el-descriptions-item>
        <el-descriptions-item label="启用状态">
          <el-tag type="success" v-if="config.is_active">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="灰度发布">
          <el-tag type="success" v-if="config.gray_release">是</el-tag>
          <el-tag type="info" v-else>否</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="灰度规则" :span="2">
          <div v-if="config.gray_rules">{{ config.gray_rules }}</div>
          <div v-else class="no-data">无</div>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          <div v-if="config.description">{{ config.description }}</div>
          <div v-else class="no-data">无</div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(config.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(config.updated_at) }}</el-descriptions-item>
      </el-descriptions>

      <div class="action-buttons" style="margin-top: 20px;">
        <el-button type="primary" @click="editConfig">编辑配置</el-button>
        <el-button type="warning" @click="viewVersions">版本历史</el-button>
        <el-button type="success" @click="pullConfig">拉取配置</el-button>
      </div>
    </el-card>

    <!-- 拉取配置对话框 -->
    <el-dialog
      title="拉取配置"
      v-model="pullDialogVisible"
      width="500px"
    >
      <el-form
        :model="pullFormData"
        label-width="100px"
      >
        <el-form-item label="应用ID">
          <el-input v-model="pullFormData.app_id" placeholder="请输入应用ID" readonly />
        </el-form-item>
        <el-form-item label="命名空间">
          <el-input v-model="pullFormData.namespace" placeholder="请输入命名空间" readonly />
        </el-form-item>
        <el-form-item label="配置键">
          <el-input v-model="pullFormData.key" placeholder="请输入配置键" readonly />
        </el-form-item>
        <el-form-item label="客户端信息">
          <el-input v-model="pullFormData.client_info" placeholder="请输入客户端信息（用于灰度发布）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="pullDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="doPullConfig">拉取配置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConfig, pullConfig } from '../api/config'

const router = useRouter()
const route = useRoute()

// 状态
const loading = ref(false)
const config = ref({})

// 拉取配置对话框
const pullDialogVisible = ref(false)
const pullFormData = ref({
  app_id: '',
  namespace: '',
  key: '',
  client_info: ''
})

// 获取配置ID
const configId = computed(() => {
  return route.params.id
})

// 加载配置详情
const loadConfigDetail = async () => {
  loading.value = true
  try {
    const data = await getConfig(configId.value)
    config.value = data
  } catch (error) {
    ElMessage.error('加载配置详情失败')
    console.error('加载配置详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/')
}

// 编辑配置
const editConfig = () => {
  router.push(`/configs/${configId.value}/edit`)
}

// 查看版本历史
const viewVersions = () => {
  router.push(`/configs/${configId.value}/versions`)
}

// 拉取配置
const doPullConfig = async () => {
  try {
    const data = await pullConfig(pullFormData.value)
    ElMessage.success('拉取配置成功')
    // 显示拉取的配置结果
    ElMessageBox.alert(
      `配置键：${data.key}\n配置值：${data.value}\n版本：${data.version}`,
      '配置详情',
      {
        confirmButtonText: '确定',
        type: 'info'
      }
    )
    pullDialogVisible.value = false
  } catch (error) {
    ElMessage.error('拉取配置失败')
    console.error('拉取配置失败:', error)
  }
}

// 打开拉取配置对话框
const openPullDialog = () => {
  pullFormData.value = {
    app_id: config.value.app_id || '',
    namespace: config.value.namespace || '',
    key: config.value.key || '',
    client_info: ''
  }
  pullDialogVisible.value = true
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化加载
onMounted(() => {
  loadConfigDetail()
})
</script>

<style scoped>
.config-detail {
  padding: 10px 0;
}

.card-header {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
}

.config-value {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.no-data {
  color: #909399;
  font-style: italic;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>