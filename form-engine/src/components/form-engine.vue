<template>
  <div class="form-engine">
    <div class="form-engine__header">
      <h2>表单引擎</h2>
      <div class="form-engine__actions">
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button @click="toggleDebug">
          {{ showDebug ? '隐藏调试' : '显示调试' }}
        </el-button>
      </div>
    </div>

    <div class="form-engine__content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="form-engine__form"
      >
        <FormItem
          v-for="(field, key) in schema.properties"
          :key="key"
          :field="field"
          :field-key="key"
          :form-data="formData"
          :form-rules="formRules"
          :disabled="disabled"
          @update:form-data="handleFormDataUpdate"
          @add-field="handleAddField"
          @remove-field="handleRemoveField"
        />
      </el-form>

      <!-- 调试信息 -->
      <div v-if="showDebug" class="form-engine__debug">
        <h3>调试信息</h3>
        <div class="form-engine__debug-section">
          <h4>表单数据 (Form Data)</h4>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>
        <div class="form-engine__debug-section">
          <h4>表单规则 (Form Rules)</h4>
          <pre>{{ JSON.stringify(formRules, null, 2) }}</pre>
        </div>
        <div class="form-engine__debug-section">
          <h4>JSON Schema</h4>
          <pre>{{ JSON.stringify(schema, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import FormItem from './FormItem.vue'

// 类型定义
interface Field {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  title?: string
  description?: string
  required?: boolean
  enum?: any[]
  enumNames?: string[]
  properties?: Record<string, Field>
  items?: Field | Field[]
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  format?: 'email' | 'url' | 'tel' | 'date' | 'time' | 'datetime' | 'password'
  component?: 'input' | 'select' | 'cascader' | 'date-picker' | 'time-picker' | 'datetime-picker' | 'input-number' | 'switch' | 'slider' | 'upload' | 'rate' | 'color-picker' | 'transfer'
  props?: Record<string, any>
  rules?: any[]
  asyncValidator?: (value: any) => Promise<boolean>
  itemsField?: Field // 用于array类型的动态字段
  default?: any
  readOnly?: boolean
  disabled?: boolean
  visible?: boolean
  dependencies?: string[]
  slot?: string
}

interface Schema {
  type: 'object'
  title?: string
  description?: string
  required?: string[]
  properties: Record<string, Field>
  additionalProperties?: boolean | Field
}

interface FormEngineProps {
  schema: Schema
  modelValue?: Record<string, any>
  rules?: Record<string, any[]>
  disabled?: boolean
  readonly?: boolean
}

interface FormEngineEmits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'submit', value: Record<string, any>): void
  (e: 'reset'): void
  (e: 'validate', valid: boolean, errors: any[]): void
}

// Props
const props = withDefaults(defineProps<FormEngineProps>(), {
  modelValue: () => ({}),
  rules: () => ({}),
  disabled: false,
  readonly: false
})

// Emits
const emit = defineEmits<FormEngineEmits>()

// Refs
const formRef = ref()
const showDebug = ref(false)

// Reactive data
const formData = reactive<Record<string, any>>({})
const formRules = reactive<Record<string, any[]>>({})

// Computed
const disabled = computed(() => props.disabled || props.readonly)

// 初始化表单数据和规则
const initForm = () => {
  // 清空现有数据
  Object.keys(formData).forEach(key => delete formData[key])
  Object.keys(formRules).forEach(key => delete formRules[key])

  // 合并传入的modelValue
  Object.assign(formData, props.modelValue || {})

  // 处理Schema
  const processSchema = (schema: Schema) => {
    Object.entries(schema.properties || {}).forEach(([key, field]) => {
      // 设置默认值
      if (formData[key] === undefined && field.default !== undefined) {
        formData[key] = field.default
      }

      // 处理嵌套对象
      if (field.type === 'object' && field.properties) {
        if (formData[key] === undefined) {
          formData[key] = {}
        }
        processSchema({
          type: 'object',
          properties: field.properties
        })
      }

      // 处理数组
      if (field.type === 'array' && field.items) {
        if (formData[key] === undefined) {
          formData[key] = []
        }
        // 如果items是对象，为数组项添加默认结构
        if (typeof field.items === 'object' && !Array.isArray(field.items) && field.items.type === 'object') {
          formData[key] = formData[key].map((item: any) => {
            if (typeof item === 'object' && item !== null) {
              return item
            }
            return {}
          })
        }
      }

      // 生成表单规则
      const rules: any[] = []

      // 必填规则
      if ((schema.required?.includes(key)) || field.required) {
        rules.push({
          required: true,
          message: field.title ? `${field.title}不能为空` : '此字段不能为空',
          trigger: field.type === 'checkbox' || field.type === 'radio' ? 'change' : 'blur'
        })
      }

      // 类型规则
      if (field.type === 'number' || field.type === 'integer') {
        rules.push({
          type: 'number',
          message: '请输入数字',
          trigger: 'blur'
        })
      } else if (field.type === 'boolean') {
        rules.push({
          type: 'boolean',
          message: '请选择布尔值',
          trigger: 'change'
        })
      }

      // 字符串长度规则
      if (field.type === 'string') {
        if (field.minLength !== undefined) {
          rules.push({
            min: field.minLength,
            message: `长度不能少于${field.minLength}个字符`,
            trigger: 'blur'
          })
        }
        if (field.maxLength !== undefined) {
          rules.push({
            max: field.maxLength,
            message: `长度不能超过${field.maxLength}个字符`,
            trigger: 'blur'
          })
        }
      }

      // 数值范围规则
      if ((field.type === 'number' || field.type === 'integer') && field.minimum !== undefined) {
        rules.push({
          min: field.minimum,
          message: `数值不能小于${field.minimum}`,
          trigger: 'blur'
        })
      }
      if ((field.type === 'number' || field.type === 'integer') && field.maximum !== undefined) {
        rules.push({
          max: field.maximum,
          message: `数值不能大于${field.maximum}`,
          trigger: 'blur'
        })
      }

      // 格式规则
      if (field.format) {
        const formatRules: Record<string, any> = {
          email: { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
          url: { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
          tel: { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
          date: { type: 'date', message: '请选择有效的日期', trigger: 'change' },
          time: { type: 'date', message: '请选择有效的时间', trigger: 'change' },
          datetime: { type: 'date', message: '请选择有效的日期时间', trigger: 'change' }
        }
        if (formatRules[field.format]) {
          rules.push(formatRules[field.format])
        }
      }

      // 正则表达式规则
      if (field.pattern) {
        rules.push({
          pattern: new RegExp(field.pattern),
          message: '格式不正确',
          trigger: 'blur'
        })
      }

      // 枚举规则
      if (field.enum && Array.isArray(field.enum)) {
        rules.push({
          validator: (rule: any, value: any, callback: any) => {
            if (value === undefined || value === null || value === '') {
              callback()
              return
            }
            if (field.enum?.includes(value)) {
              callback()
            } else {
              callback(new Error(`请选择有效的选项`))
            }
          },
          trigger: 'change'
        })
      }

      // 异步校验规则
      if (field.asyncValidator && typeof field.asyncValidator === 'function') {
        rules.push({
          validator: async (rule: any, value: any, callback: any) => {
            try {
              const valid = await field.asyncValidator(value)
              if (valid) {
                callback()
              } else {
                callback(new Error('校验失败'))
              }
            } catch (error) {
              callback(new Error(error instanceof Error ? error.message : '校验失败'))
            }
          },
          trigger: 'blur'
        })
      }

      // 合并自定义规则
      if (field.rules && Array.isArray(field.rules)) {
        rules.push(...field.rules)
      }

      // 如果有规则，添加到formRules
      if (rules.length > 0) {
        formRules[key] = rules
      }
    })
  }

  processSchema(props.schema)
}

// 初始化
initForm()

// 监听schema变化
watch(
  () => props.schema,
  () => {
    initForm()
  },
  { deep: true }
)

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(formData, newValue)
    }
  },
  { deep: true }
)

// 处理表单数据更新
const handleFormDataUpdate = (key: string, value: any) => {
  formData[key] = value
  emit('update:modelValue', formData)
}

// 处理添加字段
const handleAddField = (parentKey: string, field: Field) => {
  if (parentKey) {
    const parent = formData[parentKey]
    if (Array.isArray(parent)) {
      parent.push(field.default !== undefined ? field.default : (field.type === 'object' ? {} : field.type === 'array' ? [] : null))
    } else if (typeof parent === 'object' && parent !== null) {
      const newKey = `field_${Date.now()}`
      parent[newKey] = field.default !== undefined ? field.default : (field.type === 'object' ? {} : field.type === 'array' ? [] : null)
      // 更新schema
      if (props.schema.properties[parentKey]?.properties) {
        props.schema.properties[parentKey].properties[newKey] = field
      }
    }
  } else {
    const newKey = `field_${Date.now()}`
    formData[newKey] = field.default !== undefined ? field.default : (field.type === 'object' ? {} : field.type === 'array' ? [] : null)
    // 更新schema
    props.schema.properties[newKey] = field
  }
  emit('update:modelValue', formData)
}

// 处理移除字段
const handleRemoveField = (parentKey: string, key: string) => {
  if (parentKey) {
    const parent = formData[parentKey]
    if (Array.isArray(parent)) {
      parent.splice(parseInt(key), 1)
    } else if (typeof parent === 'object' && parent !== null) {
      delete parent[key]
      // 更新schema
      if (props.schema.properties[parentKey]?.properties) {
        delete props.schema.properties[parentKey].properties[key]
      }
    }
  } else {
    delete formData[key]
    // 更新schema
    delete props.schema.properties[key]
  }
  emit('update:modelValue', formData)
}

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate((valid: boolean, errors: any[]) => {
    if (valid) {
      emit('submit', formData)
    } else {
      emit('validate', false, errors)
    }
  })
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  emit('reset')
}

// 切换调试模式
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

// 暴露方法给父组件
defineExpose({
  validate: (callback?: (valid: boolean) => void) => {
    return formRef.value?.validate(callback)
  },
  resetFields: () => {
    formRef.value?.resetFields()
  },
  clearValidate: (props?: string | string[]) => {
    formRef.value?.clearValidate(props)
  },
  getFormData: () => {
    return formData
  }
})
</script>

<style scoped>
.form-engine {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-engine__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.form-engine__header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.form-engine__actions {
  display: flex;
  gap: 10px;
}

.form-engine__content {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
}

.form-engine__form {
  max-width: 800px;
}

.form-engine__debug {
  margin-top: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.form-engine__debug h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-engine__debug-section {
  margin-bottom: 20px;
}

.form-engine__debug-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.form-engine__debug-section pre {
  margin: 0;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  color: #303133;
}
</style>
