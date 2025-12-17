<template>
  <div class="report-export">
    <el-card>
      <h2>报表导出</h2>

      <div class="report-options">
        <el-form
          ref="reportFormRef"
          :model="reportForm"
          label-width="120px"
          style="margin-bottom: 20px;"
        >
          <el-form-item
            label="报表类型"
            prop="report_type"
            :rules="[{ required: true, message: '请选择报表类型', trigger: 'change' }]"
          >
            <el-select
              v-model="reportForm.report_type"
              placeholder="请选择报表类型"
              style="width: 200px;"
            >
              <el-option label="资产总览" value="asset_overview" />
              <el-option label="使用中资产" value="in_use_assets" />
              <el-option label="库存资产" value="in_stock_assets" />
              <el-option label="资产领用记录" value="transfer_records" />
              <el-option label="资产归还记录" value="return_records" />
            </el-select>
          </el-form-item>

          <el-form-item
            label="开始日期"
            prop="start_date"
          >
            <el-date-picker
              v-model="reportForm.start_date"
              type="date"
              placeholder="请选择开始日期"
              style="width: 200px;"
            />
          </el-form-item>

          <el-form-item
            label="结束日期"
            prop="end_date"
          >
            <el-date-picker
              v-model="reportForm.end_date"
              type="date"
              placeholder="请选择结束日期"
              style="width: 200px;"
            />
          </el-form-item>

          <el-form-item
            label="导出格式"
            prop="format"
            :rules="[{ required: true, message: '请选择导出格式', trigger: 'change' }]"
          >
            <el-select
              v-model="reportForm.format"
              placeholder="请选择导出格式"
              style="width: 200px;"
            >
              <el-option label="Excel" value="excel" />
              <el-option label="PDF" value="pdf" />
              <el-option label="CSV" value="csv" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="export-buttons">
          <el-button
            type="primary"
            @click="handleExport"
            :loading="exportLoading"
            size="large"
          >
            <el-icon><Download /></el-icon>
            导出报表
          </el-button>

          <el-button
            @click="viewStats"
            :loading="statsLoading"
            size="large"
          >
            <el-icon><DataAnalysis /></el-icon>
            查看统计
          </el-button>
        </div>
      </div>

      <!-- 统计信息卡片 -->
      <el-row :gutter="20" v-if="assetStats">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ assetStats.total_assets }}</div>
              <div class="stat-label">总资产数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ assetStats.in_use_assets }}</div>
              <div class="stat-label">使用中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ assetStats.in_stock_assets }}</div>
              <div class="stat-label">库存中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">¥{{ assetStats.total_value.toLocaleString() }}</div>
              <div class="stat-label">资产总值</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, DataAnalysis } from '@element-plus/icons-vue'
import { reportAPI } from '../utils/api'

const reportFormRef = ref()
const reportForm = ref({
  report_type: '',
  start_date: '',
  end_date: '',
  format: 'excel'
})
const exportLoading = ref(false)
const statsLoading = ref(false)
const assetStats = ref(null)

// 导出报表
const handleExport = async () => {
  try {
    await reportFormRef.value.validate()
    exportLoading.value = true

    const params = {
      type: reportForm.value.report_type,
      format: reportForm.value.format,
      start_date: reportForm.value.start_date ?
        reportForm.value.start_date.toISOString().split('T')[0] : '',
      end_date: reportForm.value.end_date ?
        reportForm.value.end_date.toISOString().split('T')[0] : ''
    }

    const response = await reportAPI.exportAssets(params)

    // 创建下载链接
    const blob = new Blob([response], {
      type: reportForm.value.format === 'pdf' ? 'application/pdf' :
            reportForm.value.format === 'excel' ? 'application/vnd.ms-excel' :
            'text/csv'
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asset_report_${new Date().getTime()}.${reportForm.value.format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    ElMessage.success('报表导出成功')
  } catch (error) {
    ElMessage.error('报表导出失败')
    console.error(error)
  } finally {
    exportLoading.value = false
  }
}

// 查看统计
const viewStats = async () => {
  try {
    statsLoading.value = true
    const response = await reportAPI.getAssetStats()
    assetStats.value = response
    ElMessage.success('统计信息加载成功')
  } catch (error) {
    ElMessage.error('统计信息加载失败')
    console.error(error)
  } finally {
    statsLoading.value = false
  }
}
</script>

<style scoped>
.report-export {
  padding: 0;
}

.report-export h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.report-options {
  margin-bottom: 30px;
}

.export-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}
</style>