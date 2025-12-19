// 智能菜谱与食材管理系统 - 紧急运行脚本
// 如果 Docker 构建失败，请直接运行此文件
// Node.js 版本: >= 16.0.0

const express = require('express');
const cors = require('cors');
const path = require('path');

// 创建应用
const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

console.log('🍳 智能菜谱与食材管理系统');
console.log('==============================');

// 模拟数据存储
let ingredients = [
    { id: '1', name: '西红柿', quantity: 5, unit: '个', expiration_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0], is_expired: false, category: { id: '1', name: '蔬菜' } },
    { id: '2', name: '鸡蛋', quantity: 12, unit: '个', expiration_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0], is_expired: false, category: { id: '2', name: '蛋类' } },
    { id: '3', name: '面粉', quantity: 1, unit: '千克', expiration_date: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0], is_expired: false, category: { id: '3', name: '谷物' } },
    { id: '4', name: '牛奶', quantity: 2, unit: '盒', expiration_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0], is_expired: true, category: { id: '4', name: '乳制品' } }
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

// 食材相关 API
app.get('/api/ingredients', (req, res) => {
    console.log('GET /api/ingredients');
    res.json(ingredients);
});

app.post('/api/ingredients', (req, res) => {
    console.log('POST /api/ingredients:', req.body);
    const newIngredient = {
        id: Math.random().toString(36).substr(2, 9),
        ...req.body,
        is_expired: false
    };
    ingredients.push(newIngredient);
    res.json(newIngredient);
});

app.patch('/api/ingredients/:id', (req, res) => {
    const id = req.params.id;
    const index = ingredients.findIndex(i => i.id === id);
    if (index !== -1) {
        ingredients[index] = { ...ingredients[index], ...req.body };
        res.json(ingredients[index]);
    } else {
        res.status(404).json({ error: 'Ingredient not found' });
    }
});

app.delete('/api/ingredients/:id', (req, res) => {
    ingredients = ingredients.filter(i => i.id !== req.params.id);
    res.json({ message: 'Ingredient deleted' });
});

app.get('/api/ingredients/status/expired', (req, res) => {
    res.json(ingredients.filter(i => i.is_expired));
});

app.get('/api/ingredients/status/expiring-soon', (req, res) => {
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    res.json(ingredients.filter(i => new Date(i.expiration_date) <= threeDaysLater && !i.is_expired));
});

// 菜谱相关 API
app.get('/api/recipes', (req, res) => {
    let filteredRecipes = [...recipes];
    if (req.query.difficulty) {
        filteredRecipes = filteredRecipes.filter(r => r.difficulty === req.query.difficulty);
    }
    if (req.query.max_cooking_time) {
        filteredRecipes = filteredRecipes.filter(r => r.cooking_time <= parseInt(req.query.max_cooking_time));
    }
    res.json(filteredRecipes);
});

app.get('/api/recipes/:id', (req, res) => {
    const recipe = recipes.find(r => r.id === req.params.id);
    res.json(recipe || null);
});

// 推荐算法 API
app.get('/api/recommendations', (req, res) => {
    const availableIngredients = ingredients.map(i => i.name.toLowerCase());
    const recommendations = recipes.map(r => {
        let matchCount = 0;
        r.ingredients.forEach(ri => {
            if (availableIngredients.includes(ri.ingredient_name.toLowerCase())) {
                matchCount++;
            }
        });
        return { recipe: r, matchCount };
    }).sort((a, b) => b.matchCount - a.matchCount);

    const resultRecipes = recommendations.map(r => r.recipe);
    const matchedCounts = Object.fromEntries(recommendations.map(r => [r.recipe.id, r.matchCount]));

    console.log('返回推荐结果:', resultRecipes.length, '个菜谱');
    res.json({ recipes: resultRecipes, matchedCounts });
});

// 前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'emergency.html'));
});

// 启动服务
app.listen(PORT, () => {
    console.log('✅ 服务已启动');
    console.log(' ');
    console.log('🌐 访问地址:');
    console.log(`   主应用: http://localhost:${PORT}`);
    console.log(`   API 文档: http://localhost:${PORT}/api/ingredients`);
    console.log(' ');
    console.log('📋 功能说明:');
    console.log('   - 添加/管理家中食材');
    console.log('   - 获取过期食材提醒');
    console.log('   - 根据现有食材推荐菜谱');
    console.log('   - 多条件筛选菜谱');
    console.log('   - 手机端完全适配');
    console.log(' ');
    console.log('💡 使用提示:');
    console.log('   - 首次使用：先添加一些食材');
    console.log('   - 系统会自动根据现有食材推荐菜谱');
    console.log('   - 过期食材会显示警告标识');
    console.log('   - 支持按难度、烹饪时间筛选菜谱');
    console.log(' ');
    console.log('==============================');
    console.log('祝用餐愉快！🍽️');
});
