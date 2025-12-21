<template>
  <div class="app">
    <header class="app-header">
      <h1>购物清单与比价工具</h1>
    </header>

    <main class="app-main">
      <div class="container">
        <section class="filters">
          <h2>筛选条件</h2>
          <div class="filter-group">
            <label>商品分类:</label>
            <select v-model="filters.category" @change="fetchProducts">
              <option value="">全部</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>购买平台:</label>
            <select v-model="filters.store" @change="fetchProducts">
              <option value="">全部</option>
              <option v-for="store in stores" :key="store" :value="store">
                {{ store }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>价格排序:</label>
            <select v-model="sortBy" @change="updateSort">
              <option value="price-asc">价格从低到高</option>
              <option value="price-desc">价格从高到低</option>
              <option value="name">商品名称</option>
            </select>
          </div>
        </section>

        <section class="products">
          <h2>商品列表</h2>
          <div class="product-grid">
            <div v-for="product in filteredProducts" :key="product.id" class="product-card">
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="category">{{ product.category }}</p>
                <p class="store">📦 {{ product.store }}</p>
                <p class="price">¥{{ product.current_price }}</p>
              </div>
              <div class="price-history" v-if="product.price_history && product.price_history.length">
                <h4>历史价格</h4>
                <ul>
                  <li v-for="(history, index) in product.price_history" :key="index">
                    {{ formatDate(history.date) }}: ¥{{ history.price }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'App',
  setup() {
    const products = ref([]);
    const categories = ref([]);
    const stores = ref([]);
    const filters = ref({
      category: '',
      store: ''
    });
    const sortBy = ref('price-asc');

    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        products.value = response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        categories.value = response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchStores = async () => {
      try {
        const response = await axios.get('/api/stores');
        stores.value = response.data;
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    const filteredProducts = computed(() => {
      let result = [...products.value];

      if (filters.value.category) {
        result = result.filter(p => p.category === filters.value.category);
      }
      if (filters.value.store) {
        result = result.filter(p => p.store === filters.value.store);
      }

      switch (sortBy.value) {
        case 'price-asc':
          result.sort((a, b) => parseFloat(a.current_price) - parseFloat(b.current_price));
          break;
        case 'price-desc':
          result.sort((a, b) => parseFloat(b.current_price) - parseFloat(a.current_price));
          break;
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }

      return result;
    });

    const updateSort = () => {
      // 排序变化时自动更新显示
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    onMounted(() => {
      fetchProducts();
      fetchCategories();
      fetchStores();
    });

    return {
      products,
      categories,
      stores,
      filters,
      sortBy,
      filteredProducts,
      fetchProducts,
      updateSort,
      formatDate
    };
  }
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  text-align: center;
}

.app-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.filters {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: inline-block;
  margin-right: 2rem;
  margin-bottom: 1rem;
}

.filter-group label {
  margin-right: 0.5rem;
  font-weight: bold;
}

.products {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}

.product-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.category {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.store {
  color: #888;
  font-size: 0.8rem;
  margin: 0.25rem 0;
}

.price {
  color: #e74c3c;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.price-history h4 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
  color: #555;
}

.price-history ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.price-history li {
  font-size: 0.85rem;
  color: #666;
  margin: 0.25rem 0;
}
</style>
