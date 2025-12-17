<template>
  <div class="asset-add">
    <el-card>
      <h2>资产入库</h2>
      <el-form
        ref="formRef"
        :model="form"
        label-width="120px"
        style="margin-top: 20px;"
      >
        <el-form-item
          label="资产编号"
          prop="asset_number"
          :rules="[{ required: true, message: '请输入资产编号', trigger: 'blur' }]"
        >
          <el-input
            v-model="form.asset_number"
            placeholder="请输入资产编号"
          />
        </el-form-item>

        <el-form-item
          label="资产名称"
          prop="name"
          :rules="[{ required: true, message: '请输入资产名称', trigger: 'blur' }]"
        >
          <el-input
            v-model="form.name"
            placeholder="请输入资产名称"
          />
        </el-form-item>

        <el-form-item
          label="资产分类"
          prop="category"
          :rules="[{ required: true, message: '请选择资产分类', trigger: 'change' }]"
        >
          <el-select
            v-model="form.category"
            placeholder="请选择资产分类"
            style="width: 100%;"
          >
            <el-option label="办公设备" value="office_equipment" />
            <el-option label="电子设备" value="electronic_equipment" />
            <el-option label="家具家电" value="furniture_appliances" />
            <el-option label="车辆设备" value="vehicle_equipment" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item
          label="购买日期"
          prop="purchase_date"
          :rules="[{ required: true, message: '请选择购买日期', trigger: 'change' }]"
        >
          <el-date-picker
            v-model="form.purchase_date"
            type="date"
            placeholder="请选择购买日期"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item
          label="价格"
          prop="price"
          :rules="[{ required: true, message: '请输入价格', trigger: 'blur' }]"
        >
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            placeholder="请输入价格"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item
          label="供应商"
          prop="supplier"
        >
          <el-input
            v-model="form.supplier"
            placeholder="请输入供应商"
          />
        </el-form-item>

        <el-form-item
          label="备注"
          prop="description"
        >
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
          >
            提交入库
          </el-button>
          <el-button
            @click="handleReset"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { assetAPI } from '../utils/api'

const formRef = ref()
const form = ref({
  asset_number: '',
  name: '',
  category: '',
  purchase_date: '',
  price: 0,
  supplier: '',
  description: ''
})
const loading = ref(false)

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 转换日期格式
    const submitData = {
      ...form.value,
      purchase_date: form.value.purchase_date ?
        form.value.purchase_date.toISOString().split('T')[0] : ''
    }

    await assetAPI.addAsset(submitData)
    ElMessage.success('资产入库成功')
    handleReset()
  } catch (error) {
    if (error.name === 'Error') {
      ElMessage.error('资产入库失败')
    }
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  formRef.value.resetFields()
  form.value = {
    asset_number: '',
    name: '',
    category: '',
    purchase_date: '',
    price: 0,
    supplier: '',
    description: ''
  }
}
</script>

<style scoped>
.asset-add {
  padding: 0;
}

.asset-add h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
}
</style>