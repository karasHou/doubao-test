<template>
  <div>
    <div class="section-header">
      <h2>食材管理</h2>
      <button class="btn" @click="showAddModal = true">添加食材</button>
    </div>

    <div v-if="ingredientStore.loading" class="loading">加载中...</div>
    <div v-else-if="ingredientStore.error" class="error">{{ ingredientStore.error }}</div>
    <div v-else>
      <div class="grid grid-3">
        <div v-for="ingredient in ingredientStore.ingredients" :key="ingredient.id" class="card ingredient-card">
          <div class="ingredient-name">{{ ingredient.name }}</div>
          <div class="ingredient-info">
            <span>数量: {{ ingredient.quantity }} {{ ingredient.unit }}</span>
            <span v-if="ingredient.category">分类: {{ ingredient.category.name }}</span>
            <span v-if="ingredient.expiration_date">
              过期: {{ formatDate(ingredient.expiration_date) }}
              <span v-if="ingredient.is_expired" class="badge expired">已过期</span>
            </span>
          </div>
          <div class="ingredient-actions">
            <button class="btn btn-secondary" @click="editIngredient(ingredient)">编辑</button>
            <button class="btn btn-danger" @click="deleteIngredient(ingredient.id)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑食材模态框 -->
    <div v-if="showAddModal || editingIngredient" class="modal">
      <div class="modal-content">
        <h3>{{ editingIngredient ? '编辑食材' : '添加食材' }}</h3>
        <form @submit.prevent="saveIngredient">
          <div class="form-group">
            <label>名称</label>
            <input v-model="formData.name" type="text" required />
          </div>
          <div class="form-group">
            <label>数量</label>
            <input v-model.number="formData.quantity" type="number" step="0.1" required />
          </div>
          <div class="form-group">
            <label>单位</label>
            <input v-model="formData.unit" type="text" required />
          </div>
          <div class="form-group">
            <label>过期日期</label>
            <input v-model="formData.expiration_date" type="date" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn">保存</button>
            <button type="button" class="btn btn-secondary" @click="cancel">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIngredientStore } from '../store/ingredientStore';

const ingredientStore = useIngredientStore();

const showAddModal = ref(false);
const editingIngredient = ref<any>(null);

const formData = ref({
  name: '',
  quantity: 1,
  unit: '',
  expiration_date: '',
  category_id: undefined,
});

onMounted(() => {
  ingredientStore.fetchIngredients();
});

const editIngredient = (ingredient: any) => {
  editingIngredient.value = ingredient;
  formData.value = {
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    expiration_date: ingredient.expiration_date?.split('T')[0],
    category_id: ingredient.category?.id,
  };
};

const saveIngredient = async () => {
  try {
    if (editingIngredient.value) {
      await ingredientStore.updateIngredient(editingIngredient.value.id, formData.value);
      editingIngredient.value = null;
    } else {
      await ingredientStore.addIngredient(formData.value);
    }
    cancel();
  } catch (err) {
    console.error(err);
  }
};

const deleteIngredient = async (id: string) => {
  if (confirm('确定要删除这个食材吗？')) {
    await ingredientStore.deleteIngredient(id);
  }
};

const cancel = () => {
  showAddModal.value = false;
  editingIngredient.value = null;
  formData.value = {
    name: '',
    quantity: 1,
    unit: '',
    expiration_date: '',
    category_id: undefined,
  };
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.ingredient-card {
  padding: 15px;
}

.ingredient-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.ingredient-info {
  margin-bottom: 15px;
}

.ingredient-info span {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
}

.ingredient-actions {
  display: flex;
  gap: 10px;
}

.badge {
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 12px;
  margin-left: 5px;
}

.expired {
  background: #dc3545;
  color: white;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.error {
  color: #dc3545;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
