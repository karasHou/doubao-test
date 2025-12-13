<template>
<div v-if="visible" class="form-item">
<!-- 基础字段 -->
<div v-if="isBasicField" class="form-item__basic">
<el-form-item
:label="field.title || fieldKey"
:prop="getPropPath"
:rules="getRules"
:help="field.description"
>
<!-- Input -->
<el-input
v-if="componentType === 'input' || componentType === 'textarea'"
v-model="fieldValue"
:type="componentType === 'textarea' ? 'textarea' : (field.format === 'password' ? 'password' : 'text')"
:rows="componentType === 'textarea' ? 3 : 1"
:placeholder="field.title ? `请输入${field.title}` : '请输入'"
:disabled="disabled || field.disabled"
:readonly="field.readOnly"
@input="handleInput"
/>

<!-- Input Number -->
<el-input-number
v-else-if="componentType === 'input-number'"
v-model="fieldValue"
:min="field.minimum"
:max="field.maximum"
:precision="getPrecision"
:disabled="disabled || field.disabled"
@change="handleChange"
/>

<!-- Select -->
<el-select
v-else-if="componentType === 'select'"
v-model="fieldValue"
:placeholder="field.title ? `请选择${field.title}` : '请选择'"
:disabled="disabled || field.disabled"
:multiple="field.type === 'array' && field.items && typeof field.items !== 'object'"
@change="handleChange"
>
<el-option
v-for="(option, index) in getEnumOptions"
:key="index"
:label="option.label"
:value="option.value"
/>
</el-select>

<!-- Cascader -->
<el-cascader
v-else-if="componentType === 'cascader'"
v-model="fieldValue"
:options="getEnumOptions"
:props="{ value: 'value', label: 'label', children: 'children' }"
:placeholder="field.title ? `请选择${field.title}` : '请选择'"
:disabled="disabled || field.disabled"
@change="handleChange"
/>

<!-- Date Picker -->
<el-date-picker
v-else-if="componentType === 'date-picker'"
v-model="fieldValue"
type="date"
:placeholder="field.title ? `请选择${field.title}` : '请选择'"
:disabled="disabled || field.disabled"
@change="handleChange"
/>

<!-- Time Picker -->
<el-time-picker
v-else-if="componentType === 'time-picker'"
v-model="fieldValue"
:placeholder="field.title ? `请选择${field.title}` : '请选择'"
:disabled="disabled || field.disabled"
@change="handleChange"
/>

<!-- DateTime Picker -->
<el-date-picker
v-else-if="componentType === 'datetime-picker'"
v-model="fieldValue"
type="datetime"
:placeholder="field.title ? `请选择${field.title}` : '请选择'"
:disabled="disabled || field.disabled"
@change="handleChange"
/>

<!-- Switch -->
<el-switch
v-else-if="componentType === 'switch'"
v-model="fieldValue"
:disabled="disabled || field.disabled"
@change="handleChange"
/>

<!-- Slider -->
<el-slider
v-else-if="componentType === 'slider'"
v-model="fieldValue"
:min="field.minimum || 0"
:max="field.maximum || 100"
:disabled="disabled || field.disabled"
@change="handleChange"
/>

<!-- Rate -->
<el-rate
v-else-if="componentType === 'rate'"
v-model="fieldValue"
:disabled="disabled || field.disabled"
@change="handleChange"
/>

<!-- Color Picker -->
<el-color-picker
v-else-if="componentType === 'color-picker'"
v-model="fieldValue"
:disabled="disabled || field.disabled"
@change="handleChange"
/>
</el-form-item>
</div>

<!-- 对象类型字段 -->
<div v-else-if="isObjectField" class="form-item__object">
<div class="form-item__object-header">
<h3>{{ field.title || fieldKey }}</h3>
<div class="form-item__object-actions">
<el-button
v-if="field.additionalProperties && typeof field.additionalProperties === 'object'"
type="text"
size="small"
@click="handleAddField"
>
添加字段
</el-button>
</div>
</div>
<div class="form-item__object-content">
<FormItem
v-for="(subField, subKey) in field.properties"
:key="subKey"
:field="subField"
:field-key="`${fieldKey}.${subKey}`"
:form-data="formData[fieldKey] || {}"
:form-rules="formRules[fieldKey] || {}"
:disabled="disabled || field.disabled"
@update:form-data="handleSubFormDataUpdate"
@add-field="handleSubAddField"
@remove-field="handleSubRemoveField"
/>
</div>
</div>

<!-- 数组类型字段 -->
<div v-else-if="isArrayField" class="form-item__array">
<div class="form-item__array-header">
<h3>{{ field.title || fieldKey }}</h3>
<div class="form-item__array-actions">
<el-button
type="text"
size="small"
@click="handleAddArrayItem"
>
添加项
</el-button>
</div>
</div>
<div class="form-item__array-content">
<div
v-for="(item, index) in arrayValue"
:key="index"
class="form-item__array-item"
>
<div class="form-item__array-item-header">
<span>第 {{ index + 1 }} 项</span>
<el-button
type="text"
size="small"
danger
@click="handleRemoveArrayItem(index)"
>
删除
</el-button>
</div>
<div class="form-item__array-item-content">
<!-- 数组项是对象 -->
<div v-if="arrayItemIsObject" class="form-item__array-item-object">
<FormItem
v-for="(subField, subKey) in arrayItemField.properties"
:key="subKey"
:field="subField"
:field-key="`${fieldKey}.${index}.${subKey}`"
:form-data="item || {}"
:form-rules="formRules[fieldKey]?.[index] || {}"
:disabled="disabled || field.disabled"
@update:form-data="handleArrayItemFormDataUpdate(index, $event)"
@add-field="handleArrayItemAddField(index, $event)"
@remove-field="handleArrayItemRemoveField(index, $event)"
/>
</div>
<!-- 数组项是基本类型 -->
<div v-else class="form-item__array-item-basic">
<el-input
v-if="arrayItemField.type === 'string' || arrayItemField.type === 'number' || arrayItemField.type === 'integer'"
:model-value="item"
:type="arrayItemField.type === 'string' ? (arrayItemField.format === 'password' ? 'password' : 'text') : 'number'"
:placeholder="`请输入${field.title || fieldKey}`"
:disabled="disabled || field.disabled"
@input="handleArrayItemInput(index, $event)"
/>
<el-switch
v-else-if="arrayItemField.type === 'boolean'"
:model-value="item"
:disabled="disabled || field.disabled"
@change="handleArrayItemChange(index, $event)"
/>
</div>
</div>
</div>
</div>
</div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Field } from '../form-engine.vue'

// Props
interface FormItemProps {
field: Field
fieldKey: string
formData: Record<string, any>
formRules: Record<string, any[]>
disabled?: boolean
}

const props = withDefaults(defineProps<FormItemProps>(), {
formData: () => ({}),
formRules: () => ({}),
disabled: false
})

// Emits
interface FormItemEmits {
(e: 'update:form-data', key: string, value: any): void
(e: 'add-field', parentKey: string, field: Field): void
(e: 'remove-field', parentKey: string, key: string): void
}

const emit = defineEmits<FormItemEmits>()

// Refs
const fieldValue = ref<any>(null)

// Computed
const visible = computed(() => props.field.visible !== false)

// 判断字段类型
const isBasicField = computed(() => {
return ['string', 'number', 'integer', 'boolean'].includes(props.field.type)
})

const isObjectField = computed(() => {
return props.field.type === 'object' && props.field.properties
})

const isArrayField = computed(() => {
return props.field.type === 'array' && props.field.items
})

// 获取组件类型
const componentType = computed(() => {
if (props.field.component) {
return props.field.component
}

const { type, format, enum: enumValues } = props.field

// 有枚举值的优先用select
if (enumValues && Array.isArray(enumValues)) {
return 'select'
}

// 根据format判断
if (format) {
const formatMap: Record<string, string> = {
email: 'input',
url: 'input',
tel: 'input',
date: 'date-picker',
time: 'time-picker',
datetime: 'datetime-picker',
password: 'input'
}
return formatMap[format] || 'input'
}

// 根据type判断
const typeMap: Record<string, string> = {
string: 'input',
number: 'input-number',
integer: 'input-number',
boolean: 'switch'
}
return typeMap[type] || 'input'
})

// 获取字段值
const getFieldValue = computed(() => {
return props.formData[props.fieldKey]
})

// 获取数组值
const arrayValue = computed(() => {
return getFieldValue.value || []
})

// 获取数组项字段配置
const arrayItemField = computed(() => {
if (!props.field.items) return {} as Field
return Array.isArray(props.field.items) ? props.field.items[0] : props.field.items
})

// 判断数组项是否为对象
const arrayItemIsObject = computed(() => {
return arrayItemField.value.type === 'object' && arrayItemField.value.properties
})

// 获取枚举选项
const getEnumOptions = computed(() => {
const { enum: enumValues, enumNames } = props.field
if (!enumValues || !Array.isArray(enumValues)) return []
return enumValues.map((value, index) => ({
value,
label: enumNames?.[index] !== undefined ? enumNames[index] : String(value)
}))
})

// 获取精度（用于数字输入）
const getPrecision = computed(() => {
const { type } = props.field
if (type === 'integer') return 0
return undefined
})

// 获取字段路径（用于表单验证）
const getPropPath = computed(() => {
return props.fieldKey
})

// 获取字段规则
const getRules = computed(() => {
return props.formRules[props.fieldKey] || []
})

// 监听字段值变化
watch(
getFieldValue,
(newValue) => {
fieldValue.value = newValue
},
{ immediate: true, deep: true }
)

// 监听字段值内部变化
watch(
fieldValue,
(newValue) => {
if (newValue !== getFieldValue.value) {
emit('update:form-data', props.fieldKey, newValue)
}
},
{ deep: true }
)

// 处理输入
const handleInput = (value: any) => {
emit('update:form-data', props.fieldKey, value)
}

// 处理变化
const handleChange = (value: any) => {
emit('update:form-data', props.fieldKey, value)
}

// 处理子表单数据更新
const handleSubFormDataUpdate = (subKey: string, value: any) => {
const currentValue = props.formData[props.fieldKey] || {}
const newValue = { ...currentValue, [subKey]: value }
emit('update:form-data', props.fieldKey, newValue)
}

// 处理子字段添加
const handleSubAddField = (parentKey: string, field: Field) => {
emit('add-field', `${props.fieldKey}.${parentKey}`, field)
}

// 处理子字段删除
const handleSubRemoveField = (parentKey: string, key: string) => {
emit('remove-field', `${props.fieldKey}.${parentKey}`, key)
}

// 处理字段添加
const handleAddField = () => {
if (props.field.additionalProperties && typeof props.field.additionalProperties === 'object') {
emit('add-field', props.fieldKey, props.field.additionalProperties)
}
}

// 处理添加数组项
const handleAddArrayItem = () => {
const currentValue = getFieldValue.value || []
const defaultValue = arrayItemField.value.default !== undefined ? arrayItemField.value.default : (arrayItemField.value.type === 'object' ? {} : arrayItemField.value.type === 'array' ? [] : null)
const newValue = [...currentValue, defaultValue]
emit('update:form-data', props.fieldKey, newValue)
}

// 处理删除数组项
const handleRemoveArrayItem = (index: number) => {
const currentValue = getFieldValue.value || []
const newValue = [...currentValue]
newValue.splice(index, 1)
emit('update:form-data', props.fieldKey, newValue)
}

// 处理数组项数据更新
const handleArrayItemFormDataUpdate = (index: number, subKey: string, value: any) => {
const currentValue = getFieldValue.value || []
const item = currentValue[index] || {}
const newItem = { ...item, [subKey]: value }
const newValue = [...currentValue]
newValue[index] = newItem
emit('update:form-data', props.fieldKey, newValue)
}

// 处理数组项字段添加
const handleArrayItemAddField = (index: number, parentKey: string, field: Field) => {
emit('add-field', `${props.fieldKey}.${index}.${parentKey}`, field)
}

// 处理数组项字段删除
const handleArrayItemRemoveField = (index: number, parentKey: string, key: string) => {
emit('remove-field', `${props.fieldKey}.${index}.${parentKey}`, key)
}

// 处理数组项输入
const handleArrayItemInput = (index: number, value: any) => {
const currentValue = getFieldValue.value || []
const newValue = [...currentValue]
newValue[index] = value
emit('update:form-data', props.fieldKey, newValue)
}

// 处理数组项变化
const handleArrayItemChange = (index: number, value: any) => {
const currentValue = getFieldValue.value || []
const newValue = [...currentValue]
newValue[index] = value
emit('update:form-data', props.fieldKey, newValue)
}
</script>

<style scoped>
.form-item {
margin-bottom: 20px;
}

.form-item__basic {}

.form-item__object {
border: 1px solid #ebeef5;
border-radius: 4px;
padding: 15px;
margin-bottom: 20px;
}

.form-item__object-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 15px;
padding-bottom: 10px;
border-bottom: 1px solid #ebeef5;
}

.form-item__object-header h3 {
margin: 0;
font-size: 16px;
font-weight: 600;
color: #303133;
}

.form-item__object-actions {}

.form-item__object-content {}

.form-item__array {
border: 1px solid #ebeef5;
border-radius: 4px;
padding: 15px;
margin-bottom: 20px;
}

.form-item__array-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 15px;
padding-bottom: 10px;
border-bottom: 1px solid #ebeef5;
}

.form-item__array-header h3 {
margin: 0;
font-size: 16px;
font-weight: 600;
color: #303133;
}

.form-item__array-actions {}

.form-item__array-content {}

.form-item__array-item {
border: 1px solid #ebeef5;
border-radius: 4px;
padding: 15px;
margin-bottom: 15px;
background: #fafafa;
}

.form-item__array-item:last-child {
margin-bottom: 0;
}

.form-item__array-item-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 15px;
padding-bottom: 10px;
border-bottom: 1px solid #ebeef5;
}

.form-item__array-item-header span {
font-size: 14px;
font-weight: 600;
color: #606266;
}

.form-item__array-item-content {}

.form-item__array-item-object {}

.form-item__array-item-basic {}
</style>
