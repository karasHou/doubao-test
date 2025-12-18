<template>
  <div class="ticket-detail-container">
    <div class="page-header">
      <h1>工单详情</h1>
      <el-button @click="$router.go(-1)">返回</el-button>
    </div>

    <div v-loading="loading" class="ticket-info">
      <el-row>
        <el-col :span="12">
          <el-descriptions title="工单信息" border column="1" :size="descriptionsSize">
            <el-descriptions-item label="工单ID">
              {{ ticket.id }}
            </el-descriptions-item>
            <el-descriptions-item label="标题">
              {{ ticket.title }}
            </el-descriptions-item>
            <el-descriptions-item label="分类">
              <el-tag
                :type="
                  ticket.category === 'bug'
                    ? 'danger'
                    : ticket.category === 'feature'
                    ? 'success'
                    : ticket.category === 'support'
                    ? 'info'
                    : 'warning'
                "
              >
                {{
                  ticket.category === 'bug'
                    ? 'Bug'
                    : ticket.category === 'feature'
                    ? '功能请求'
                    : ticket.category === 'support'
                    ? '技术支持'
                    : '其他'
                }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag
                :type="
                  ticket.priority === 'urgent'
                    ? 'danger'
                    : ticket.priority === 'high'
                    ? 'warning'
                    : ticket.priority === 'medium'
                    ? 'info'
                    : 'success'
                "
              >
                {{
                  ticket.priority === 'low'
                    ? '低'
                    : ticket.priority === 'medium'
                    ? '中'
                    : ticket.priority === 'high'
                    ? '高'
                    : '紧急'
                }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                :type="
                  ticket.status === 'open'
                    ? 'info'
                    : ticket.status === 'in_progress'
                    ? 'warning'
                    : ticket.status === 'resolved'
                    ? 'success'
                    : 'danger'
                "
              >
                {{
                  ticket.status === 'open'
                    ? '待处理'
                    : ticket.status === 'in_progress'
                    ? '处理中'
                    : ticket.status === 'resolved'
                    ? '已解决'
                    : '已关闭'
                }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(ticket.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(ticket.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="12">
          <el-card title="操作" class="action-card">
            <el-form :model="updateForm" label-width="80px">
              <el-form-item label="状态">
                <el-select v-model="updateForm.status" @change="handleStatusChange">
                  <el-option label="待处理" value="open" />
                  <el-option label="处理中" value="in_progress" />
                  <el-option label="已解决" value="resolved" />
                  <el-option label="已关闭" value="closed" />
                </el-select>
              </el-form-item>
              <el-form-item label="负责人">
                <el-input v-model="updateForm.assigneeId" placeholder="请输入负责人ID" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUpdate" :loading="updating">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="24">
          <el-card title="描述" class="description-card">
            <div class="description-content">{{ ticket.description }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getTicketById, updateTicket } from '../api/ticket';

const route = useRoute();
const loading = ref(false);
const updating = ref(false);
const ticket = ref({
  id: '',
  title: '',
  description: '',
  category: '',
  priority: '',
  status: '',
  submitterId: '',
  assigneeId: '',
  createdAt: '',
  updatedAt: '',
});

const updateForm = ref({
  status: '',
  assigneeId: '',
});

const descriptionsSize = computed(() => 'large');

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN');
};

const loadTicket = async () => {
  try {
    loading.value = true;
    const response = await getTicketById(route.params.id);
    ticket.value = response;
    updateForm.value = {
      status: response.status,
      assigneeId: response.assigneeId || '',
    };
  } catch (error) {
    ElMessage.error('加载工单详情失败');
    console.error('加载工单详情错误:', error);
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async () => {
  try {
    updating.value = true;
    const response = await updateTicket(route.params.id, updateForm.value);
    ElMessage.success('工单更新成功');
    loadTicket();
  } catch (error) {
    ElMessage.error('工单更新失败');
    console.error('更新工单错误:', error);
  } finally {
    updating.value = false;
  }
};

const handleStatusChange = () => {
  console.log('状态变更为:', updateForm.value.status);
};

onMounted(() => {
  loadTicket();
});
</script>

<style scoped>
.ticket-detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ticket-info {
  max-width: 1200px;
  margin: 0 auto;
}

.action-card {
  height: 100%;
}

.description-card {
  margin-top: 20px;
}

.description-content {
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 14px;
}
</style>
