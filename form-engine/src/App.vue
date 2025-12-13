<template>
  <div class="app-container">
    <h1>表单引擎演示</h1>

    <!-- 表单引擎使用示例 -->
    <div class="demo-section">
      <h2>用户信息表单</h2>
      <FormEngine
        ref="formRef"
        :schema="userSchema"
        v-model="formData"
        @submit="handleSubmit"
        @reset="handleReset"
      />
    </div>

    <!-- 动态字段演示 -->
    <div class="demo-section">
      <h2>动态字段演示</h2>
      <el-button type="primary" @click="addDynamicField">添加动态字段</el-button>
      <el-button @click="removeDynamicField">移除动态字段</el-button>
      <el-button @click="clearDynamicFields">清空动态字段</el-button>
    </div>

    <!-- 性能测试演示 -->
    <div class="demo-section">
      <h2>性能测试</h2>
      <el-slider
        v-model="fieldCount"
        :min="10"
        :max="200"
        :step="10"
        show-input
        input-size="small"
        @change="generateLargeSchema"
      />
      <el-button type="primary" @click="generateLargeSchema">生成大表单</el-button>
      <el-button @click="testPerformance">测试性能</el-button>
      <p>字段数量: {{ fieldCount }}</p>
      <p v-if="renderTime">渲染时间: {{ renderTime }}ms</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import FormEngine from './components/form-engine.vue'
import type { Schema } from './components/form-engine.vue'

// Refs
const formRef = ref()
const fieldCount = ref(50)
const renderTime = ref<number | null>(null)

// Reactive data
const formData = reactive({})

// 用户信息表单 Schema
const userSchema = ref<Schema>({
  type: 'object',
  title: '用户信息',
  description: '请填写完整的用户信息',
  required: ['name', 'email', 'age', 'gender'],
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      description: '请输入真实姓名',
      minLength: 2,
      maxLength: 20,
      component: 'input',
      default: ''
    },
    email: {
      type: 'string',
      title: '邮箱',
      description: '请输入有效的邮箱地址',
      format: 'email',
      component: 'input',
      default: ''
    },
    phone: {
      type: 'string',
      title: '手机号',
      description: '请输入有效的手机号码',
      format: 'tel',
      component: 'input',
      default: ''
    },
    age: {
      type: 'integer',
      title: '年龄',
      description: '请输入年龄',
      minimum: 18,
      maximum: 100,
      component: 'input-number',
      default: 18
    },
    gender: {
      type: 'string',
      title: '性别',
      description: '请选择性别',
      enum: ['male', 'female', 'other'],
      enumNames: ['男', '女', '其他'],
      component: 'select',
      default: 'male'
    },
    birthday: {
      type: 'string',
      title: '生日',
      description: '请选择生日',
      format: 'date',
      component: 'date-picker',
      default: ''
    },
    address: {
      type: 'object',
      title: '地址',
      description: '请填写详细地址',
      properties: {
        province: {
          type: 'string',
          title: '省份',
          enum: ['beijing', 'shanghai', 'guangdong'],
          enumNames: ['北京', '上海', '广东'],
          component: 'select',
          default: ''
        },
        city: {
          type: 'string',
          title: '城市',
          component: 'input',
          default: ''
        },
        district: {
          type: 'string',
          title: '区县',
          component: 'input',
          default: ''
        },
        detail: {
          type: 'string',
          title: '详细地址',
          description: '请输入街道、门牌号等详细信息',
          minLength: 5,
          component: 'textarea',
          default: ''
        }
      },
      additionalProperties: {
        type: 'string',
        title: '自定义地址字段',
        component: 'input'
      }
    },
    interests: {
      type: 'array',
      title: '兴趣爱好',
      description: '请选择您的兴趣爱好',
      items: {
        type: 'string',
        enum: ['reading', 'music', 'sports', 'travel', 'coding'],
        enumNames: ['阅读', '音乐', '运动', '旅行', '编程']
      },
      component: 'select',
      default: []
    },
    skills: {
      type: 'array',
      title: '技能特长',
      description: '请添加您的技能特长',
      items: {
        type: 'object',
        title: '技能',
        properties: {
          name: {
            type: 'string',
            title: '技能名称',
            component: 'input',
            default: ''
          },
          level: {
            type: 'string',
            title: '熟练程度',
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            enumNames: ['初级', '中级', '高级', '专家'],
            component: 'select',
            default: 'beginner'
          },
          years: {
            type: 'integer',
            title: '从业年限',
            minimum: 0,
            maximum: 50,
            component: 'input-number',
            default: 0
          }
        }
      },
      default: []
    },
    experience: {
      type: 'array',
      title: '工作经历',
      description: '请添加您的工作经历',
      items: {
        type: 'object',
        title: '工作经历',
        properties: {
          company: {
            type: 'string',
            title: '公司名称',
            component: 'input',
            default: ''
          },
          position: {
            type: 'string',
            title: '职位',
            component: 'input',
            default: ''
          },
          startDate: {
            type: 'string',
            title: '开始日期',
            format: 'date',
            component: 'date-picker',
            default: ''
          },
          endDate: {
            type: 'string',
            title: '结束日期',
            format: 'date',
            component: 'date-picker',
            default: ''
          },
          description: {
            type: 'string',
            title: '工作描述',
            component: 'textarea',
            default: ''
          }
        }
      },
      default: []
    },
    isActive: {
      type: 'boolean',
      title: '是否激活',
      description: '请选择是否激活账户',
      component: 'switch',
      default: true
    },
    score: {
      type: 'number',
      title: '评分',
      description: '请输入评分',
      minimum: 0,
      maximum: 100,
      component: 'slider',
      default: 80
    },
    rating: {
      type: 'number',
      title: '星级评价',
      description: '请选择星级',
      minimum: 1,
      maximum: 5,
      component: 'rate',
      default: 5
    },
    avatar: {
      type: 'string',
      title: '头像',
      description: '请上传头像',
      component: 'upload',
      default: ''
    },
    color: {
      type: 'string',
      title: '主题颜色',
      description: '请选择主题颜色',
      component: 'color-picker',
      default: '#409eff'
    },
    remarks: {
      type: 'string',
      title: '备注',
      description: '请输入备注信息',
      component: 'textarea',
      default: ''
    }
  },
  additionalProperties: {
    type: 'string',
    title: '自定义字段',
    component: 'input'
  }
})

// 大表单 Schema
const largeSchema = ref<Schema>({
  type: 'object',
  title: '大表单测试',
  description: '用于测试表单引擎性能的大表单',
  properties: {},
  additionalProperties: false
})

// 处理表单提交
const handleSubmit = (data: any) => {
  console.log('表单提交数据:', data)
  alert('表单提交成功！\n\n请查看控制台输出的详细数据。')
}

// 处理表单重置
const handleReset = () => {
  console.log('表单重置')
  alert('表单已重置！')
}

// 添加动态字段
const addDynamicField = () => {
  const fieldKey = `dynamic_field_${Date.now()}`
  const fieldTypes = ['string', 'number', 'integer', 'boolean']
  const components = ['input', 'input-number', 'select', 'switch']

  userSchema.value.properties[fieldKey] = {
    type: fieldTypes[Math.floor(Math.random() * fieldTypes.length)] as any,
    title: `动态字段 ${fieldKey.substring(fieldKey.length - 8)}`,
    description: `这是一个动态添加的字段`,
    component: components[Math.floor(Math.random() * components.length)],
    default: ''
  }

  console.log('添加动态字段:', fieldKey)
}

// 移除动态字段
const removeDynamicField = () => {
  const properties = Object.keys(userSchema.value.properties)
  const dynamicFields = properties.filter(key => key.startsWith('dynamic_field_'))

  if (dynamicFields.length > 0) {
    const fieldKey = dynamicFields[dynamicFields.length - 1]
    delete userSchema.value.properties[fieldKey]
    delete formData[fieldKey]
    console.log('移除动态字段:', fieldKey)
  } else {
    alert('没有可移除的动态字段！')
  }
}

// 清空动态字段
const clearDynamicFields = () => {
  const properties = Object.keys(userSchema.value.properties)
  const dynamicFields = properties.filter(key => key.startsWith('dynamic_field_'))

  if (dynamicFields.length > 0) {
    dynamicFields.forEach(fieldKey => {
      delete userSchema.value.properties[fieldKey]
      delete formData[fieldKey]
    })
    console.log('清空所有动态字段')
    alert(`已清空 ${dynamicFields.length} 个动态字段！`)
  } else {
    alert('没有可清空的动态字段！')
  }
}

// 生成大表单 Schema
const generateLargeSchema = () => {
  const count = fieldCount.value
  const newProperties: Record<string, any> = {}

  for (let i = 0; i < count; i++) {
    const fieldKey = `field_${i + 1}`
    const fieldType = i % 5 === 0 ? 'number' : i % 3 === 0 ? 'boolean' : 'string'
    const component = i % 5 === 0 ? 'input-number' : i % 3 === 0 ? 'switch' : i % 4 === 0 ? 'select' : 'input'

    newProperties[fieldKey] = {
      type: fieldType,
      title: `字段 ${i + 1}`,
      description: `这是第 ${i + 1} 个字段，用于性能测试`,
      component: component,
      default: fieldType === 'boolean' ? false : fieldType === 'number' ? 0 : '',
      ...(component === 'select' && {
        enum: ['option1', 'option2', 'option3'],
        enumNames: ['选项1', '选项2', '选项3']
      })
    }
  }

  largeSchema.value = {
    ...largeSchema.value,
    properties: newProperties
  }

  console.log(`生成大表单，包含 ${count} 个字段`)
}

// 测试性能
const testPerformance = async () => {
  // 确保已经生成了大表单
  if (Object.keys(largeSchema.value.properties).length === 0) {
    generateLargeSchema()
    await nextTick()
  }

  // 测试渲染性能
  const start = performance.now()

  // 强制重新渲染
  const oldSchema = largeSchema.value
  largeSchema.value = { ...oldSchema }

  await nextTick()

  const end = performance.now()
  renderTime.value = end - start

  console.log(`表单渲染时间: ${renderTime.value}ms`)
  alert(`表单渲染完成！\n\n渲染时间: ${renderTime.value.toFixed(2)}ms\n字段数量: ${fieldCount.value}`)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #303133;
  line-height: 1.6;
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 32px;
  font-weight: 600;
  color: #303133;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #409eff;
}

.demo-section {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.demo-section:last-child {
  margin-bottom: 0;
}

/* Element Plus 组件样式覆盖 */
.demo-section :deep(.el-form-item__label) {
  font-weight: 500;
}

.demo-section :deep(.el-form-item__content) {
  max-width: 600px;
}

/* 按钮样式 */
.demo-section .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

/* 滑块样式 */
.demo-section .el-slider {
  width: 400px;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  .demo-section {
    padding: 20px;
  }

  .demo-section .el-slider {
    width: 100%;
  }

  .demo-section :deep(.el-form-item__content) {
    max-width: 100%;
  }
}
</style>
