<template>
  <div class="item-form">
    <el-form ref="formRef" :model="form" label-width="120px" style="max-width: 600px;">
      <el-form-item label="物品名称" prop="name" required>
        <el-input v-model="form.name" placeholder="请输入物品名称" />
      </el-form-item>
      <el-form-item label="物品描述" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入物品描述" :rows="3" />
      </el-form-item>
      <el-form-item label="分类" prop="category_id" required>
        <el-select v-model="form.category_id" placeholder="请选择分类">
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="品牌" prop="brand">
        <el-input v-model="form.brand" placeholder="请输入品牌" />
      </el-form-item>
      <el-form-item label="型号" prop="model">
        <el-input v-model="form.model" placeholder="请输入型号" />
      </el-form-item>
      <el-form-item label="购买价格" prop="original_price" required>
        <el-input v-model.number="form.original_price" placeholder="请输入购买价格" />
      </el-form-item>
      <el-form-item label="物品状况" prop="condition" required>
        <el-select v-model="form.condition" placeholder="请选择物品状况">
          <el-option label="全新" :value="5" />
          <el-option label="几乎全新" :value="4" />
          <el-option label="良好" :value="3" />
          <el-option label="一般" :value="2" />
          <el-option label="较差" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="购买日期" prop="purchase_date">
        <el-date-picker
          v-model="form.purchase_date"
          type="date"
          placeholder="选择购买日期"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="预估价格">
        <el-input :model-value="estimatedPrice" disabled />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../utils/api'

const formRef = ref()
const categories = ref([])
const form = ref({
  name: '',
  description: '',
  category_id: null,
  brand: '',
  model: '',
  original_price: null,
  condition: 3,
  purchase_date: null
})
const estimatedPrice = ref(0)

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

const estimatePrice = async () => {
  if (form.value.original_price && form.value.condition) {
    try {
      estimatedPrice.value = '计算中...'
      const tempItem = { ...form.value }
      const estimated = tempItem.original_price * (1 - (5 - tempItem.condition) * 0.1)
      setTimeout(() => {
        estimatedPrice.value = estimated.toFixed(2)
      }, 500)
    } catch (error) {
      ElMessage.error('估价失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    const response = await api.items.create(form.value)
    if (response.success) {
      ElMessage.success('物品添加成功')
      handleReset()
    }
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const handleReset = () => {
  form.value = {
    name: '',
    description: '',
    category_id: null,
    brand: '',
    model: '',
    original_price: null,
    condition: 3,
    purchase_date: null
  }
  estimatedPrice.value = 0
  formRef.value?.resetFields()
}

watch(
  () => [form.value.original_price, form.value.condition],
  () => {
    estimatePrice()
  }
)

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.item-form {
  padding: 20px;
}
</style>