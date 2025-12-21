<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-800">Fit System</h1>
          </div>
          <nav class="flex space-x-4">
            <button
              @click="activeTab = 'plans'"
              :class="['px-3 py-2 rounded-md text-sm font-medium', activeTab === 'plans' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700']"
            >
              训练计划
            </button>
            <button
              @click="activeTab = 'records'"
              :class="['px-3 py-2 rounded-md text-sm font-medium', activeTab === 'records' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700']"
            >
              训练记录
            </button>
            <button
              @click="activeTab = 'stats'"
              :class="['px-3 py-2 rounded-md text-sm font-medium', activeTab === 'stats' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700']"
            >
              统计分析
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Training Plans Tab -->
        <div v-if="activeTab === 'plans'">
          <h2 class="text-lg font-semibold mb-4">训练计划管理</h2>
          <button
            @click="showAddPlanModal = true"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            添加新计划
          </button>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="plan in plans" :key="plan.id" class="bg-white p-4 rounded shadow">
              <h3 class="font-semibold">{{ plan.name }}</h3>
              <p class="text-sm text-gray-600">{{ plan.description }}</p>
              <p class="text-sm">周期: {{ plan.duration_weeks }} 周</p>
              <p class="text-sm">强度: {{ plan.intensity_level }}/5</p>
            </div>
          </div>
        </div>

        <!-- Training Records Tab -->
        <div v-if="activeTab === 'records'">
          <h2 class="text-lg font-semibold mb-4">训练记录</h2>
          <button
            @click="showAddRecordModal = true"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            添加记录
          </button>
          <div class="space-y-4">
            <div v-for="record in records" :key="record.id" class="bg-white p-4 rounded shadow">
              <h3 class="font-semibold">训练日期: {{ record.training_date }}</h3>
              <p class="text-sm">表现评分: {{ record.performance_rating }}/5</p>
              <p class="text-sm">{{ record.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Stats Tab -->
        <div v-if="activeTab === 'stats'">
          <h2 class="text-lg font-semibold mb-4">训练统计</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-4 rounded shadow">
              <h3 class="font-semibold">每周训练统计</h3>
              <div v-for="stat in weeklyStats" :key="stat.week_start">
                <p class="text-sm">{{ stat.week_start }}</p>
                <p class="text-sm">训练次数: {{ stat.training_sessions }}</p>
              </div>
            </div>
            <div class="bg-white p-4 rounded shadow">
              <h3 class="font-semibold">月度训练统计</h3>
              <div v-for="stat in monthlyStats" :key="stat.month_start">
                <p class="text-sm">{{ stat.month_start }}</p>
                <p class="text-sm">训练次数: {{ stat.training_sessions }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Plan Modal -->
    <div v-if="showAddPlanModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 class="text-lg font-semibold mb-4">添加新训练计划</h3>
        <form @submit.prevent="addPlan">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">计划名称</label>
            <input v-model="newPlan.name" type="text" class="w-full px-3 py-2 border rounded" required>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea v-model="newPlan.description" class="w-full px-3 py-2 border rounded" rows="3"></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">周期（周）</label>
            <input v-model.number="newPlan.duration_weeks" type="number" class="w-full px-3 py-2 border rounded" min="1" max="12" value="4">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">强度级别（1-5）</label>
            <input v-model.number="newPlan.intensity_level" type="number" class="w-full px-3 py-2 border rounded" min="1" max="5" value="3">
          </div>
          <div class="flex space-x-2">
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              添加
            </button>
            <button type="button" @click="showAddPlanModal = false" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Record Modal -->
    <div v-if="showAddRecordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 class="text-lg font-semibold mb-4">添加训练记录</h3>
        <form @submit.prevent="addRecord">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">选择训练计划</label>
            <select v-model="newRecord.plan_id" class="w-full px-3 py-2 border rounded" required>
              <option value="">请选择计划</option>
              <option v-for="plan in plans" :key="plan.id" :value="plan.id">{{ plan.name }}</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">训练日期</label>
            <input v-model="newRecord.training_date" type="date" class="w-full px-3 py-2 border rounded" required>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">表现评分（1-5）</label>
            <input v-model.number="newRecord.performance_rating" type="number" class="w-full px-3 py-2 border rounded" min="1" max="5" required>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea v-model="newRecord.notes" class="w-full px-3 py-2 border rounded" rows="3"></textarea>
          </div>
          <div class="flex space-x-2">
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              添加
            </button>
            <button type="button" @click="showAddRecordModal = false" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from './services/api';

export default {
  name: 'App',
  setup() {
    const activeTab = ref('plans');
    const plans = ref([]);
    const records = ref([]);
    const weeklyStats = ref([]);
    const monthlyStats = ref([]);
    const showAddPlanModal = ref(false);
    const showAddRecordModal = ref(false);

    const newPlan = ref({
      name: '',
      description: '',
      duration_weeks: 4,
      intensity_level: 3,
      exercises: []
    });

    const newRecord = ref({
      plan_id: null,
      training_date: new Date().toISOString().split('T')[0],
      exercises: [],
      notes: '',
      performance_rating: 3
    });

    const fetchPlans = async () => {
      try {
        const response = await api.get('/plans');
        plans.value = response.data;
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    const fetchRecords = async () => {
      try {
        const response = await api.get('/records');
        records.value = response.data;
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    const fetchWeeklyStats = async () => {
      try {
        const response = await api.get('/stats/weekly');
        weeklyStats.value = response.data;
      } catch (error) {
        console.error('Error fetching weekly stats:', error);
      }
    };

    const fetchMonthlyStats = async () => {
      try {
        const response = await api.get('/stats/monthly');
        monthlyStats.value = response.data;
      } catch (error) {
        console.error('Error fetching monthly stats:', error);
      }
    };

    const addPlan = async () => {
      try {
        await api.post('/plans', newPlan.value);
        showAddPlanModal.value = false;
        newPlan.value = {
          name: '',
          description: '',
          duration_weeks: 4,
          intensity_level: 3,
          exercises: []
        };
        fetchPlans();
      } catch (error) {
        console.error('Error adding plan:', error);
      }
    };

    const addRecord = async () => {
      try {
        await api.post('/records', newRecord.value);
        showAddRecordModal.value = false;
        newRecord.value = {
          plan_id: null,
          training_date: new Date().toISOString().split('T')[0],
          exercises: [],
          notes: '',
          performance_rating: 3
        };
        fetchRecords();
        fetchPlans();
        fetchWeeklyStats();
        fetchMonthlyStats();
      } catch (error) {
        console.error('Error adding record:', error);
      }
    };

    onMounted(() => {
      fetchPlans();
      fetchRecords();
      fetchWeeklyStats();
      fetchMonthlyStats();
    });

    return {
      activeTab,
      plans,
      records,
      weeklyStats,
      monthlyStats,
      showAddPlanModal,
      showAddRecordModal,
      newPlan,
      newRecord,
      addPlan,
      addRecord
    };
  }
};
</script>
