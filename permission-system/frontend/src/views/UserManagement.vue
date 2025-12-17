<template>
  <div class="user-management-container">
    <div class="page-header">
      <h1>用户管理</h1>
      <p>管理系统用户账号</p>
    </div>
    
    <div class="content-section">
      <div class="toolbar">
        <button 
          class="btn btn-primary" 
          @click="handleAddUser"
          v-permission="'user:create'"
        >
          <span>➕</span>
          <span>新增用户</span>
        </button>
        
        <div class="search-bar">
          <input
            type="text"
            class="search-input"
            placeholder="搜索用户名或邮箱..."
            v-model="searchKeyword"
            @input="handleSearch"
          />
          <button class="btn btn-secondary" @click="handleRefresh">
            <span>🔄</span>
            <span>刷新</span>
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>昵称</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.nickname || '-' }}</td>
              <td>
                <span class="status-badge" :class="user.status === 1 ? 'active' : 'inactive'">
                  {{ user.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <button 
                  class="btn btn-sm btn-primary" 
                  @click="handleEditUser(user)"
                  v-permission="'user:update'"
                >
                  编辑
                </button>
                <button 
                  class="btn btn-sm btn-danger" 
                  @click="handleDeleteUser(user.id)"
                  v-permission="'user:delete'"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="users.length === 0" class="empty-state">
          <p>暂无用户数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 用户列表数据
const users = ref<any[]>([]);
const searchKeyword = ref('');

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 加载用户数据
const loadUsers = async () => {
  try {
    // 这里应该调用 API 获取实际用户数据
    // 暂时使用模拟数据
    users.value = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        nickname: '管理员',
        status: 1,
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 2,
        username: 'user1',
        email: 'user1@example.com',
        nickname: '用户1',
        status: 1,
        createdAt: '2023-01-02T00:00:00Z',
      },
    ];
  } catch (error) {
    console.error('加载用户数据失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  loadUsers();
};

// 刷新
const handleRefresh = () => {
  searchKeyword.value = '';
  loadUsers();
};

// 新增用户
const handleAddUser = () => {
  console.log('新增用户');
};

// 编辑用户
const handleEditUser = (user: any) => {
  console.log('编辑用户:', user);
};

// 删除用户
const handleDeleteUser = (userId: number) => {
  if (confirm(`确定要删除用户 ID 为 ${userId} 的用户吗？`)) {
    console.log('删除用户:', userId);
  }
};

// 页面挂载时加载数据
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-management-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 5px 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.content-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 250px;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background-color: #f8f9fa;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.data-table th {
  font-weight: 600;
  color: #333;
  background-color: #f5f7fa;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}
</style>
