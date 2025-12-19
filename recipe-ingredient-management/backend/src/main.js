// 智能菜谱与食材管理系统 - 完整后端服务
const express = require('express');
const path = require('path');

console.log('🍳 智能菜谱与食材管理系统');
console.log('================================');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
// 手动处理 CORS 头部
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 内存数据存储
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
    description: '经典的中式家常菜，简单又美味',
    cooking_time: 15,
    difficulty: '简单',
    cuisine_type: '中式',
    servings: 2,
    instructions: '1. 西红柿切块，鸡蛋打散\n2. 热锅倒油，倒入鸡蛋液\n3. 鸡蛋凝固后盛出备用\n4. 锅中再倒油，炒香葱花\n5. 加入西红柿翻炒至出汁\n6. 加入炒好的鸡蛋\n7. 加盐调味，翻炒均匀\n8. 出锅装盘',
    ingredients: [
      { id: 'r1', ingredient_name: '西红柿', quantity: 2, unit: '个' },
      { id: 'r2', ingredient_name: '鸡蛋', quantity: 3, unit: '个' },
      { id: 'r3', ingredient_name: '盐', quantity: 0.5, unit: '茶匙' }
    ],
    tags: [
      { id: 't1', tag: '家常菜' },
      { id: 't2', tag: '快手菜' }
    ]
  },
  {
    id: '2',
    name: '鸡蛋羹',
    description: '嫩滑的蒸鸡蛋羹，营养丰富',
    cooking_time: 10,
    difficulty: '简单',
    cuisine_type: '中式',
    servings: 1,
    instructions: '1. 鸡蛋打散，加入温水\n2. 过滤掉泡沫\n3. 盖上保鲜膜扎小孔\n4. 蒸锅中火蒸8分钟\n5. 淋上生抽调味',
    ingredients: [
      { id: 'r4', ingredient_name: '鸡蛋', quantity: 2, unit: '个' },
      { id: 'r5', ingredient_name: '温水', quantity: 150, unit: '毫升' },
      { id: 'r6', ingredient_name: '生抽', quantity: 1, unit: '茶匙' }
    ],
    tags: [
      { id: 't3', tag: '早餐' },
      { id: 't4', tag: '儿童餐' }
    ]
  }
];

// 内存缓存系统
const cache = new Map();

// API 路由

// 食材管理
app.get('/api/ingredients', (req, res) => {
  console.log('获取所有食材列表');
  res.json(ingredients);
});

app.post('/api/ingredients', (req, res) => {
  const newIngredient = {
    id: Date.now().toString(),
    ...req.body,
    is_expired: false
  };
  ingredients.push(newIngredient);
  console.log('新增食材:', req.body.name);
  res.json(newIngredient);
});

app.patch('/api/ingredients/:id', (req, res) => {
  const id = req.params.id;
  const index = ingredients.findIndex(ing => ing.id === id);

  if (index !== -1) {
    ingredients[index] = { ...ingredients[index], ...req.body };
    console.log('更新食材:', ingredients[index].name);
    res.json(ingredients[index]);
  } else {
    res.status(404).json({ error: '食材不存在' });
  }
});

app.delete('/api/ingredients/:id', (req, res) => {
  const id = req.params.id;
  const originalLength = ingredients.length;
  ingredients = ingredients.filter(ing => ing.id !== id);
  res.json({ success: ingredients.length < originalLength });
});

// 过期提醒
app.get('/api/ingredients/status/expired', (req, res) => {
  const expiredIngredients = ingredients.filter(
    ing => new Date(ing.expiration_date) < new Date()
  );
  res.json(expiredIngredients);
});

app.get('/api/ingredients/status/expiring-soon', (req, res) => {
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const expiringSoonIngredients = ingredients.filter(
    ing => new Date(ing.expiration_date) <= threeDaysFromNow && new Date(ing.expiration_date) >= new Date()
  );
  res.json(expiringSoonIngredients);
});

// 菜谱管理
app.get('/api/recipes', (req, res) => {
  let filteredRecipes = recipes;

  // 支持筛选
  if (req.query.difficulty) {
    filteredRecipes = filteredRecipes.filter(
      recipe => recipe.difficulty === req.query.difficulty
    );
  }

  if (req.query.max_cooking_time) {
    const maxTime = parseInt(req.query.max_cooking_time);
    filteredRecipes = filteredRecipes.filter(
      recipe => recipe.cooking_time <= maxTime
    );
  }

  res.json(filteredRecipes);
});

// 智能推荐
app.get('/api/recommendations', (req, res) => {
  const availableIngredients = ingredients.map(ing => ing.name.toLowerCase());

  const recommendations = recipes.map(recipe => {
    let matchCount = 0;
    recipe.ingredients.forEach(ri => {
      if (availableIngredients.includes(ri.ingredient_name.toLowerCase())) {
        matchCount++;
      }
    });
    return { recipe, matchCount };
  }).sort((a, b) => b.matchCount - a.matchCount);

  const result = {
    recipes: recommendations.map(r => r.recipe),
    matchedCounts: Object.fromEntries(
      recommendations.map(r => [r.recipe.id, r.matchCount])
    )
  };

  console.log('返回推荐结果:', result.recipes.length, '个菜谱');
  res.json(result);
});

// 静态文件服务
app.use(express.static(path.join(__dirname, '../../public')));

// 应用首页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

// 启动服务
app.listen(PORT, () => {
  console.log('✅ 服务已成功启动！');
  console.log(' ');
  console.log('🌐 访问地址:');
  console.log(`   • 主应用: http://localhost:${PORT}`);
  console.log(`   • API 文档: http://localhost:${PORT}/api/ingredients`);
  console.log(' ');
  console.log('📋 系统功能:');
  console.log('   • 添加/编辑/删除食材');
  console.log('   • 过期食材智能提醒');
  console.log('   • 基于现有食材推荐菜谱');
  console.log('   • 按难度、时间筛选菜谱');
  console.log('   • 支持手机和平板访问');
  console.log(' ');
  console.log('🍳 开始使用吧！');
  console.log('   提示：先添加一些食材，系统会为你智能推荐适合的菜谱。');
  console.log('   记得及时处理过期食材哦！');
  console.log(' ');
  console.log('================================');
});
