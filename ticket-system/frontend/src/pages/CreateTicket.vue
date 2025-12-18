<template>
  <div class="create-ticket-container">
    <div class="page-header">
      <h1>新建工单</h1>
      <el-button @click="$router.go(-1)">取消</el-button>
    </div>

    <el-form
      ref="ticketForm"
      :model="ticketForm"
      :rules="ticketRules"
      class="ticket-form"
      label-width="120px"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="ticketForm.title" placeholder="请输入工单标题" maxlength="100" show-word-limit />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select v-model="ticketForm.category" placeholder="请选择工单分类">
          <el-option label="Bug" value="bug" />
          <el-option label="功能请求" value="feature" />
          <el-option label="技术支持" value="support" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="优先级" prop="priority">
        <el-select v-model="ticketForm.priority" placeholder="请选择工单优先级">
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
          <el-option label="紧急" value="urgent" />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="ticketForm.description"
          type="textarea"
          placeholder="请输入工单详细描述"
          :rows="6"
          maxlength="5000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
          提交工单
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { createTicket } from '../api/ticket';

const router = useRouter();
const ticketForm = ref({
  title: '',
  description: '',
  category: 'other',
  priority: 'medium',
  submitterId: '1', // 简化处理，实际应该从登录用户信息获取
});

const ticketRules = ref({
  title: [
    { required: true, message: '请输入工单标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入工单描述', trigger: 'blur' },
    { min: 10, max: 5000, message: '描述长度在 10 到 5000 个字符', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择工单分类', trigger: 'change' }],
  priority: [{ required: true, message: '请选择工单优先级', trigger: 'change' }],
});

const loading = ref(false);

const handleSubmit = async () => {
  try {
    const valid = await ticketForm.value.validate();
    if (!valid) return;

    loading.value = true;
    const response = await createTicket(ticketForm.value);

    ElMessage.success('工单创建成功');
    console.log('工单创建成功:', response);

    // 跳转到工单详情页
    router.push(`/tickets/${response.id}`);
  } catch (error) {
    ElMessage.error('工单创建失败，请重试');
    console.error('创建工单错误:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.create-ticket-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ticket-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: white;
}
</style>
