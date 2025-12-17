<template>
  <div class="asset-list">
    <el-card>
      <div class="card-header">
        <h2>资产列表</h2>
        <el-input
          v-model="searchText"
          placeholder="搜索资产名称、编号或使用人"
          style="width: 300px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table
        :data="assets"
        border
        stripe
        style="width: 100%; margin-top: 20px;"
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
            <el-tag
              :type="getStatusType(scope.row.status)"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="user"
          label="使用人"
          width="120"
        />
        <el-table-column
          prop="purchase_date"
          label="购买日期"
          width="150"
        />
        <el-table-column
          prop="price"
          label="价格"
          width="120"
          formatter="formatPrice"
        />
        <el-table-column
          label="操作"
          width="200"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button
              size="small"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right;"
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { assetAPI } from '../utils/api'

const assets = ref([])
const searchText = ref('')
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取资产列表
const fetchAssets = async () => {
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      search: searchText.value
    }
    const response = await assetAPI.getAssets(params)
    assets.value = response.data
    pagination.value.total = response.total
  } catch (error) {
    ElMessage.error('获取资产列表失败')
    console.error(error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  fetchAssets()
}

// 分页变化
const handlePageChange = () => {
  fetchAssets()
}

// 查看资产
const handleView = (row) => {
  ElMessage.info(`查看资产: ${row.name}`)
  // 可以打开详情弹窗
}

// 编辑资产
const handleEdit = (row) => {
  ElMessage.info(`编辑资产: ${row.name}`)
  // 可以打开编辑表单
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    'in_stock': 'success',
    'in_use': 'primary',
    'maintenance': 'warning',
    'discarded': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'in_stock': '库存中',
    'in_use': '使用中',
    'maintenance': '维修中',
    'discarded': '已报废'
  }
  return statusMap[status] || status
}

// 格式化价格
const formatPrice = (row, column, cellValue) => {
  return `¥${cellValue}`
}

// 挂载时获取资产列表
onMounted(() => {
  fetchAssets()
})
</script>

<style scoped>
.asset-list {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}
</style>