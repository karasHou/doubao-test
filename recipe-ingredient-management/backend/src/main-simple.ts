#!/usr/bin/env node
// 简化版 Node.js 服务，用于快速验证功能
const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('🍳 智能菜谱与食材管理系统启动');
console.log('================================');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 模拟数据库数据
let ingredients = [
  {
    id: '1',
    name: '西红柿',
    category: { id: '1', name: '蔬菜' },
    quantity: 5,
    unit: '个',
    expiration_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    is_expired: false
  },
  {
    id: '2',
    name: '鸡蛋',
    category: { id: '2', name: '蛋类' },
    quantity: 12,
    unit: '个',
    expiration_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    is_expired: false
  },
  {
    id: '3',
    name: '面粉',
    category: { id: '3', name: '谷物' },
    quantity: 1,
    unit: '千克',
    expiration_date: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
    is_expired: false
  }
];

let recipes = [
  {
    id: '1',
    name: '西红柿炒蛋',
    description: '经典的中式家常菜',
    cooking_time: 15,
    difficulty: '简单',
    cuisine_type: '中式',
    servings: 2,
    instructions: '1. 切西红柿\n2. 打鸡蛋\n3. 翻炒...',
    ingredients: [
      { id: 'r1', ingredient_name: '西红柿', quantity: 2, unit: '个' },
      { id: 'r2', ingredient_name: '鸡蛋', quantity: 3, unit: '个' }
    ],
    tags: [
      { id: 't1', tag: '家常菜' },
      { id: 't2', tag: '快手菜' }
    ]
  }
];

// 内存缓存
const cache = new Map();

// API 路由
app.get('/api/ingredients', (req, res) => {
  console.log('获取所有食材');
  res.json(ingredients);
});

app.post('/api/ingredients', (req, res) => {
  const newIngredient = { id: Date.now().toString(), ...req.body };
  ingredients.push(newIngredient);
  console.log('添加新食材:', req.body.name);
  res.json(newIngredient);
});

app.patch('/api/ingredients/:id', (req, res) => {
  const id = req.params.id;
  const index = ingredients.findIndex(i => i.id === id);
  if (index !== -1) {
    ingredients[index] = { ...ingredients[index], ...req.body };
    res.json(ingredients[index]);
  }
  res.status(404).json({ error: '未找到食材' });
});

app.delete('/api/ingredients/:id', (req, res) => {
  const id = req.params.id;
  const lengthBefore = ingredients.length;
  ingredients = ingredients.filter(i => i.id !== id);
  res.json({ success: ingredients.length < lengthBefore });
});

app.get('/api/ingredients/status/expired', (req, res) => {
  res.json(ingredients.filter(i => new Date(i.expiration_date) < new Date()));
});

app.get('/api/ingredients/status/expiring-soon', (req, res) => {
  const threeDays = new Date(Date.now() + 3 * 24 * 3600 * 1000);
  res.json(ingredients.filter(i => new Date(i.expiration_date) <= threeDays && new Date(i.expiration_date) >= new Date()));
});

app.get('/api/recipes', (req, res) => {
  res.json(recipes);
});

app.get('/api/recommendations', (req, res) => {
  // 简单推荐算法
  const availableIngredients = ingredients.map(i => i.name.toLowerCase());

  const recommendations = recipes.map(recipe => {
    let matchCount = 0;
    recipe.ingredients.forEach(ri => {
      if (availableIngredients.includes(ri.ingredient_name.toLowerCase())) {
        matchCount++;
      }
    });
    return { recipe, matchCount };
  }).sort((a, b) => b.matchCount - a.matchCount);

  console.log('返回推荐菜谱');
  res.json({
    recipes: recommendations.map(r => r.recipe),
    matchedCounts: Object.fromEntries(recommendations.map(r => [r.recipe.id, r.matchCount]))
  });
});

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 启动服务
app.listen(PORT, () => {
  console.log('✅ 服务已成功启动');
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(' ');
  console.log('📋 可用功能:');
  console.log('   • 添加/管理食材');
  console.log('   • 获取过期提醒');
  console.log('   • 智能推荐菜谱');
  console.log('   • 多条件筛选');
  console.log('   • 完整移动端支持');
  console.log(' ');
  console.log('==============================');
  console.log('🎊 系统已准备就绪！');
});
