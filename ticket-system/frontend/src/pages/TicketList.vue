<template>
  <div class="ticket-list-container">
    <div class="page-header">
      <h1>工单管理</h1>
      <el-button type="primary" @click="$router.push('/tickets/create')">
        <el-icon-plus />
        新建工单
      </el-button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索工单标题或描述"
            prefix-icon="Search"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.status" placeholder="选择状态">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="open" />
            <el-option label="处理中" value="in_progress" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.priority" placeholder="选择优先级">
            <el-option label="全部" value="" />
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.category" placeholder="选择分类">
            <el-option label="全部" value="" />
            <el-option label="Bug" value="bug" />
            <el-option label="功能请求" value="feature" />
            <el-option label="技术支持" value="support" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 工单列表 -->
    <el-table
      v-loading="loading"
      :data="tickets"
      border
      stripe
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="id" label="工单ID" width="180" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="120">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.category === 'bug'
                ? 'danger'
                : scope.row.category === 'feature'
                ? 'success'
                : scope.row.category === 'support'
                ? 'info'
                : 'warning'
            "
          >
            {{
              scope.row.category === 'bug'
                ? 'Bug'
                : scope.row.category === 'feature'
                ? '功能请求'
                : scope.row.category === 'support'
                ? '技术支持'
                : '其他'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="120">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.priority === 'urgent'
                ? 'danger'
                : scope.row.priority === 'high'
                ? 'warning'
                : scope.row.priority === 'medium'
                ? 'info'
                : 'success'
            "
          >
            {{
              scope.row.priority === 'low'
                ? '低'
                : scope.row.priority === 'medium'
                ? '中'
                : scope.row.priority === 'high'
                ? '高'
                : '紧急'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.status === 'open'
                ? 'info'
                : scope.row.status === 'in_progress'
                ? 'warning'
                : scope.row.status === 'resolved'
                ? 'success'
                : 'danger'
            "
          >
            {{
              scope.row.status === 'open'
                ? '待处理'
                : scope.row.status === 'in_progress'
                ? '处理中'
                : scope.row.status === 'resolved'
                ? '已解决'
                : '已关闭'
            }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="$router.push(`/tickets/${scope.row.id}`)"
          >
            查看详情
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      class="pagination"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.current"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getTickets, searchTickets, deleteTicket } from '../api/ticket';

const loading = ref(false);
const tickets = ref([]);
const total = ref(0);
const searchKeyword = ref('');
const filters = ref({
  status: '',
  priority: '',
  category: '',
});
const pagination = ref({
  current: 1,
  size: 10,
});

const loadTickets = async (isSearch = false) => {
  try {
    loading.value = true;
    let response;

    if (isSearch && searchKeyword.value) {
      response = await searchTickets({
        q: searchKeyword.value,
        status: filters.value.status || undefined,
        priority: filters.value.priority || undefined,
        category: filters.value.category || undefined,
      });
    } else {
      response = await getTickets({
        status: filters.value.status || undefined,
        priority: filters.value.priority || undefined,
        category: filters.value.category || undefined,
      });
    }

    tickets.value = response;
    total.value = response.length;
  } catch (error) {
    ElMessage.error('加载工单列表失败');
    console.error('加载工单列表错误:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.value.current = 1;
  loadTickets(true);
};

const resetFilters = () => {
  searchKeyword.value = '';
  filters.value = {
    status: '',
    priority: '',
    category: '',
  };
  pagination.value.current = 1;
  loadTickets(false);
};

const handleDelete = async (id) => {
  try {
    await deleteTicket(id);
    ElMessage.success('删除工单成功');
    loadTickets();
  } catch (error) {
    ElMessage.error('删除工单失败');
    console.error('删除工单错误:', error);
  }
};

const handleSizeChange = (val) => {
  pagination.value.size = val;
  pagination.value.current = 1;
  loadTickets();
};

const handleCurrentChange = (val) => {
  pagination.value.current = val;
  loadTickets();
};

onMounted(() => {
  loadTickets();
});
</script>

<style scoped>
.ticket-list-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-filter-section {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
