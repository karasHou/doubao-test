<template>
  <div class="item-list">
    <div class="filter-bar">
      <el-select v-model="filter.category_id" placeholder="选择分类" @change="loadItems">
        <el-option label="全部" :value="null" />
        <el-option
          v-for="category in categories"
          :key="category.id"
          :label="category.name"
          :value="category.id"
        />
      </el-select>
      <el-button type="primary" @click="showPriceTrend">价格趋势</el-button>
    </div>

    <el-table :data="items" border stripe>
      <el-table-column prop="name" label="物品名称" min-width="150" />
      <el-table-column prop="category_name" label="分类" width="120" />
      <el-table-column prop="brand" label="品牌" width="100" />
      <el-table-column prop="model" label="型号" width="100" />
      <el-table-column prop="original_price" label="购买价格" width="100">
        <template #default="scope">{{ scope.row.original_price | formatPrice }}</template>
      </el-table-column>
      <el-table-column prop="estimated_price" label="预估价格" width="100">
        <template #default="scope">{{ scope.row.estimated_price | formatPrice }}</template>
      </el-table-column>
      <el-table-column prop="condition" label="状况" width="80">
        <template #default="scope">
          <el-tag :type="getConditionTagType(scope.row.condition)">
            {{ getConditionText(scope.row.condition) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="purchase_date" label="购买日期" width="120" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewPriceTrend(scope.row)">
            价格趋势
          </el-button>
          <el-button type="danger" size="small" @click="deleteItem(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="trendDialogVisible"
      title="价格趋势分析"
      width="800px"
      append-to-body
    >
      <div id="priceTrendChart" style="width: 100%; height: 400px;"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import api from '../utils/api'

const items = ref([])
const categories = ref([])
const filter = ref({
  category_id: null
})
const trendDialogVisible = ref(false)
const currentItemId = ref(null)
let trendChart = null

const loadItems = async () => {
  try {
    const response = await api.items.getAll(filter.value)
    if (response.success) {
      items.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载物品失败')
  }
}

const loadCategories = async () => {
  try {
    const response = await api.categories.getAll()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const deleteItem = async (id) => {
  try {
    const response = await api.items.delete(id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadItems()
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const viewPriceTrend = async (item) => {
  currentItemId.value = item.id
  trendDialogVisible.value = true
}

const showPriceTrend = () => {
  if (items.value.length > 0) {
    currentItemId.value = items.value[0].id
    trendDialogVisible.value = true
  } else {
    ElMessage.warning('没有物品可以查看价格趋势')
  }
}

const loadPriceTrendData = async () => {
  if (!currentItemId.value) return

  try {
    const response = await api.items.getPriceHistory(currentItemId.value)
    if (response.success) {
      const data = response.data
      renderPriceTrendChart(data)
    }
  } catch (error) {
    ElMessage.error('加载价格趋势数据失败')
  }
}

const renderPriceTrendChart = (data) => {
  const chartDom = document.getElementById('priceTrendChart')
  if (!chartDom) return

  if (trendChart) {
    trendChart.dispose()
  }

  trendChart = echarts.init(chartDom)

  const option = {
    title: {
      text: '价格变动趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.estimated_at)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '价格',
      type: 'line',
      data: data.map(item => item.price)
    }]
  }

  trendChart.setOption(option)
}

const getConditionText = (condition) => {
  const texts = ['', '较差', '一般', '良好', '几乎全新', '全新']
  return texts[condition] || '未知'
}

const getConditionTagType = (condition) => {
  const types = ['', 'danger', 'warning', 'info', 'success', 'success']
  return types[condition] || 'default'
}

const formatPrice = (value) => {
  return `¥${value ? parseFloat(value).toFixed(2) : '0.00'}`
}

onMounted(() => {
  loadItems()
  loadCategories()
})

watch(trendDialogVisible, (newValue) => {
  if (newValue && currentItemId.value) {
    setTimeout(() => {
      loadPriceTrendData()
    }, 100)
  }
})

onBeforeUnmount(() => {
  if (trendChart) {
    trendChart.dispose()
  }
})

</script>

<style scoped>
.item-list {
  padding: 20px;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
</style>