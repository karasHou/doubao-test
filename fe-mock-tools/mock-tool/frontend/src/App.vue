<template>
  <div class="container">
    <div class="header">
      <h1>API Mock 工具</h1>
      <div class="scene-selector">
        <label for="scene">当前场景：</label>
        <select id="scene" v-model="selectedScene" @change="updateScene">
          <option value="normal">正常场景</option>
          <option value="error">异常场景</option>
          <option value="edge">边界场景</option>
        </select>
      </div>
    </div>

    <div class="content">
      <div class="card">
        <h2>创建 Mock 规则</h2>
        <form @submit.prevent="createRule">
          <div class="form-group">
            <label>HTTP 方法</label>
            <select v-model="newRule.method">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div class="form-group">
            <label>接口路径</label>
            <input v-model="newRule.path" placeholder="/api/user/:id" />
          </div>

          <h3>场景配置</h3>
          <div v-for="scene in ['normal', 'error', 'edge']" :key="scene" class="scene-config">
            <h4>{{ scene }}</h4>
            <div class="form-group">
              <label>状态码</label>
              <input v-model.number="newRule.scenes[scene].status" type="number" />
            </div>
            <div class="form-group">
              <label>响应数据</label>
              <textarea v-model="newRule.scenes[scene].response" rows="4" placeholder='{"message": "success"}'></textarea>
            </div>
          </div>

          <button type="submit" class="btn">创建规则</button>
        </form>
      </div>

      <div class="card">
        <h2>Mock 规则列表</h2>
        <ul class="rules-list">
          <li v-for="rule in rules" :key="rule.id" class="rule-item">
            <h3>{{ rule.method }} {{ rule.path }}</h3>
            <div v-for="scene in rule.scenes" :key="scene.name">
              <strong>{{ scene.name }}:</strong> {{ scene.status }}
            </div>
            <button class="btn btn-danger" @click="deleteRule(rule.id)">删除</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      selectedScene: 'normal',
      rules: [],
      newRule: {
        method: 'GET',
        path: '',
        scenes: {
          normal: { status: 200, response: '{"message": "success"}' },
          error: { status: 500, response: '{"error": "server error"}' },
          edge: { status: 400, response: '{"error": "bad request"}' }
        }
      }
    };
  },
  mounted() {
    this.loadRules();
    this.loadScene();
  },
  methods: {
    async loadRules() {
      try {
        const response = await axios.get('/api/rules');
        this.rules = response.data;
      } catch (error) {
        console.error('加载规则失败:', error);
      }
    },
    async loadScene() {
      try {
        const response = await axios.get('/api/scene');
        this.selectedScene = response.data.currentScene;
      } catch (error) {
        console.error('加载场景失败:', error);
      }
    },
    async createRule() {
      try {
        const ruleData = {
          method: this.newRule.method,
          path: this.newRule.path,
          scenes: Object.entries(this.newRule.scenes).map(([name, config]) => ({
            name,
            status: config.status,
            response: config.response
          }))
        };
        await axios.post('/api/rules', ruleData);
        this.loadRules();
        this.newRule.path = '';
      } catch (error) {
        console.error('创建规则失败:', error);
      }
    },
    async deleteRule(id) {
      try {
        await axios.delete(`/api/rules/${id}`);
        this.loadRules();
      } catch (error) {
        console.error('删除规则失败:', error);
      }
    },
    async updateScene() {
      try {
        await axios.post('/api/scene', { scene: this.selectedScene });
      } catch (error) {
        console.error('更新场景失败:', error);
      }
    }
  }
};
</script>