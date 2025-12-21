const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// 内存存储 Mock 规则和当前场景
let mockRules = [];
let currentScene = 'normal';

// API 路由 - 获取所有 Mock 规则
app.get('/api/rules', (req, res) => {
  res.json(mockRules);
});

// API 路由 - 创建 Mock 规则
app.post('/api/rules', (req, res) => {
  const rule = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockRules.push(rule);
  res.json(rule);
});

// API 路由 - 更新 Mock 规则
app.put('/api/rules/:id', (req, res) => {
  const id = req.params.id;
  const index = mockRules.findIndex(r => r.id === id);
  if (index !== -1) {
    mockRules[index] = {
      ...mockRules[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json(mockRules[index]);
  } else {
    res.status(404).json({ error: 'Rule not found' });
  }
});

// API 路由 - 删除 Mock 规则
app.delete('/api/rules/:id', (req, res) => {
  const id = req.params.id;
  mockRules = mockRules.filter(r => r.id !== id);
  res.json({ message: 'Rule deleted successfully' });
});

// API 路由 - 获取当前场景
app.get('/api/scene', (req, res) => {
  res.json({ currentScene });
});

// API 路由 - 设置当前场景
app.post('/api/scene', (req, res) => {
  currentScene = req.body.scene || 'normal';
  res.json({ currentScene });
});

// 路径匹配函数：支持参数化路径如 /api/user/:id
function matchPath(rulePath, requestPath) {
  // 精确匹配
  if (rulePath === requestPath) return true;

  // 转换为正则表达式匹配参数化路径
  const ruleParts = rulePath.split('/');
  const requestParts = requestPath.split('/');

  if (ruleParts.length !== requestParts.length) return false;

  for (let i = 0; i < ruleParts.length; i++) {
    const rulePart = ruleParts[i];
    const requestPart = requestParts[i];

    // 检查是否是参数 :param 格式
    if (rulePart.startsWith(':')) {
      continue; // 参数部分匹配任意值
    } else if (rulePart !== requestPart) {
      return false; // 非参数部分必须完全匹配
    }
  }

  return true;
}

// 提取路径参数
function extractPathParams(rulePath, requestPath) {
  const params = {};
  const ruleParts = rulePath.split('/');
  const requestParts = requestPath.split('/');

  for (let i = 0; i < ruleParts.length; i++) {
    const rulePart = ruleParts[i];
    const requestPart = requestParts[i];

    if (rulePart.startsWith(':')) {
      const paramName = rulePart.substring(1);
      params[paramName] = requestPart;
    }
  }

  return params;
}

// Mock 接口处理
app.all('*', (req, res) => {
  const method = req.method;
  const url = req.originalUrl.split('?')[0];

  // 查找匹配的 Mock 规则
  let matchingRule = null;
  let pathParams = {};

  for (const rule of mockRules) {
    if (rule.method === method && rule.scenes.some(s => s.name === currentScene)) {
      if (matchPath(rule.path, url)) {
        matchingRule = rule;
        pathParams = extractPathParams(rule.path, url);
        break;
      }
    }
  }

  if (matchingRule) {
    const sceneConfig = matchingRule.scenes.find(s => s.name === currentScene);

    // 设置响应状态码
    res.status(sceneConfig.status || 200);

    // 设置响应头
    if (sceneConfig.headers) {
      Object.entries(sceneConfig.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    // 处理动态参数
    let responseData = sceneConfig.response;
    if (typeof responseData === 'string') {
      // 替换动态参数
      responseData = responseData.replace(/{{(.*?)}}/g, (match, param) => {
        // 尝试从请求中获取参数
        const pathParam = pathParams[param];
        const queryParam = req.query[param];
        const bodyParam = req.body && req.body[param];

        return pathParam || queryParam || bodyParam || '';
      });
      try {
        responseData = JSON.parse(responseData);
      } catch (e) {
        // 保持字符串形式
      }
    }

    res.json(responseData);
  } else {
    res.status(404).json({ error: 'No mock rule found for this endpoint and scene' });
  }
});

// 服务启动
app.listen(PORT, () => {
  console.log(`Mock Tool Backend running on port ${PORT}`);
  console.log(`Current scene: ${currentScene}`);
});