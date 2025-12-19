// 智能菜谱与食材管理系统 - 独立运行版本
// 无任何外部依赖，直接运行
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

console.log('🍳 智能菜谱与食材管理系统 (独立运行版)');
console.log('========================================');

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
    description: '经典的中式家常菜',
    cooking_time: 15,
    difficulty: '简单',
    cuisine_type: '中式',
    servings: 2,
    instructions: '1. 切西红柿\n2. 打鸡蛋\n3. 翻炒',
    ingredients: [{ name: '西红柿', qty: 2, unit: '个' }, { name: '鸡蛋', qty: 3, unit: '个' }],
    tags: ['家常菜', '快手菜']
  }
];

// 处理 API 请求
function handleApiRequest(req, res, parsedUrl) {
  const [, , endpoint, param] = parsedUrl.pathname.split('/');

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 食材相关接口
  if (endpoint === 'ingredients') {
    if (req.method === 'GET') {
      if (param === 'status') {
        const statusType = parsedUrl.pathname.split('/')[3];
        let result;
        if (statusType === 'expired') {
          result = ingredients.filter(i => new Date(i.expiration_date) < new Date());
        } else if (statusType === 'expiring-soon') {
          const threeDays = new Date(Date.now() + 3 * 24 * 3600 * 1000);
          result = ingredients.filter(i => new Date(i.expiration_date) <= threeDays && new Date(i.expiration_date) >= new Date());
        } else {
          result = ingredients;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(ingredients));
      }
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const newItem = JSON.parse(body);
        newItem.id = Date.now().toString();
        ingredients.push(newItem);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newItem));
      });
    } else if (req.method === 'DELETE' && param) {
      ingredients = ingredients.filter(i => i.id !== param);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    }
  }
  // 菜谱相关接口
  else if (endpoint === 'recipes') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(recipes));
    }
  }
  // 推荐相关接口
  else if (endpoint === 'recommendations') {
    if (req.method === 'GET') {
      const availableIngredients = ingredients.map(i => i.name.toLowerCase());
      const recommendations = recipes.map(r => {
        let matches = 0;
        r.ingredients.forEach(ing => {
          if (availableIngredients.includes(ing.name.toLowerCase())) matches++;
        });
        return { recipe: r, matchCount: matches };
      }).sort((a, b) => b.matchCount - a.matchCount);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        recipes: recommendations.map(r => r.recipe),
        matchedCounts: recommendations.reduce((acc, r) => { acc[r.recipe.id] = r.matchCount; return acc; }, {})
      }));
    }
  }
}

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // API 路由
  if (parsedUrl.pathname.startsWith('/api/')) {
    handleApiRequest(req, res, parsedUrl);
    return;
  }

  // 静态文件服务
  if (parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>智能菜谱管理系统</title>
    <style>
        body { font-family: sans-serif; margin: 20px; padding: 0; background: #f5f5f5; }
        .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 10px; }
        h1 { text-align: center; color: #333; }
        button { background: #007bff; color: white; border: none; padding: 10px; margin: 5px; cursor: pointer; border-radius: 5px; }
        button:hover { background: #0056b3; }
        form { margin: 10px 0; }
        input, select { margin: 5px; padding: 5px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }
        .card { background: #f9f9f9; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .expired { background: #ffe6e6; }
        .warning { background: #fff3cd; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍳 智能菜谱与食材管理系统</h1>

        <div>
            <h2>选择功能</h2>
            <button onclick="showTab('ingredients')">🥬 食材管理</button>
            <button onclick="showTab('recipes')">📝 菜谱推荐</button>
            <button onclick="showTab('expired')">⚠️ 过期提醒</button>
        </div>

        <div id="ingredients-tab" class="tab-content">
            <h3>食材管理</h3>
            <form onsubmit="addIngredient(event)">
                <input type="text" id="name" placeholder="食材名称" required>
                <input type="number" id="qty" placeholder="数量" required>
                <input type="text" id="unit" placeholder="单位" required>
                <input type="date" id="exp" required>
                <select id="cat">
                    <option value="蔬菜">蔬菜</option>
                    <option value="肉类">肉类</option>
                    <option value="水果">水果</option>
                </select>
                <button type="submit">添加</button>
            </form>
            <h3>食材列表:</h3>
            <div id="ingredients-list" class="grid"></div>
        </div>

        <div id="recipes-tab" class="tab-content" style="display:none;">
            <h3>推荐菜谱</h3>
            <div id="recipes-list" class="grid"></div>
        </div>

        <div id="expired-tab" class="tab-content" style="display:none;">
            <h3>过期提醒</h3>
            <div id="expired-list"></div>
        </div>
    </div>

    <script>
        const API = 'http://localhost:3004/api';

        async function loadIngredients() {
            const res = await fetch(\`\${API}/ingredients\`);
            const data = await res.json();
            document.getElementById('ingredients-list').innerHTML = data.map(ing => \`
                <div class="card">
                    <h4>\${ing.name}</h4>
                    <p>\${ing.quantity} \${ing.unit}</p>
                    <p>过期: \${ing.expiration_date}</p>
                    <button onclick="deleteIngredient('\${ing.id}')">删除</button>
                </div>
            \`).join('');
        }

        async function addIngredient(e) {
            e.preventDefault();
            const data = {
                name: document.getElementById('name').value,
                quantity: parseFloat(document.getElementById('qty').value),
                unit: document.getElementById('unit').value,
                expiration_date: document.getElementById('exp').value,
                category: { name: document.getElementById('cat').value }
            };

            await fetch(\`\${API}/ingredients\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            loadIngredients();
            e.target.reset();
        }

        async function deleteIngredient(id) {
            await fetch(\`\${API}/ingredients/\${id}\`, { method: 'DELETE' });
            loadIngredients();
        }

        async function loadRecipes() {
            const res = await fetch(\`\${API}/recommendations\`);
            const data = await res.json();
            document.getElementById('recipes-list').innerHTML = data.recipes.map(r => \`
                <div class="card">
                    <h4>\${r.name}</h4>
                    <p>\${r.description}</p>
                    <p>\${r.cooking_time}分钟，\${r.difficulty}</p>
                </div>
            \`).join('');
        }

        async function loadExpired() {
            const [expired, expiring] = await Promise.all([
                fetch(\`\${API}/ingredients/status/expired\`),
                fetch(\`\${API}/ingredients/status/expiring-soon\`)
            ].map(r => r.json()));

            let html = '<h4>已过期:</h4>';
            html += expired.map(i => \`
                <div class="card expired">
                    <h5>\${i.name}</h5>
                    <p>过期日期: \${i.expiration_date}</p>
                </div>
            \`).join('');

            html += '<h4>即将过期:</h4>';
            html += expiring.map(i => \`
                <div class="card warning">
                    <h5>\${i.name}</h5>
                    <p>过期日期: \${i.expiration_date}</p>
                </div>
            \`).join('');

            document.getElementById('expired-list').innerHTML = html;
        }

        function showTab(tab) {
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            document.getElementById(tab + '-tab').style.display = 'block';
            if (tab === 'ingredients') loadIngredients();
            if (tab === 'recipes') loadRecipes();
            if (tab === 'expired') loadExpired();
        }

        window.onload = loadIngredients;
    </script>
</body>
</html>
    `;
    res.end(html);
    return;
  }
});

const PORT = 3004;
server.listen(PORT, () => {
  console.log('✅ 系统已启动');
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(' ');
  console.log('🎯 核心功能:');
  console.log('   • 添加管理食材');
  console.log('   • 过期提醒');
  console.log('   • 智能推荐菜谱');
  console.log('   • 手机端支持');
  console.log(' ');
  console.log('💡 使用提示:');
  console.log('   - 打开浏览器访问 http://localhost:3004');
  console.log('   - 先添加一些食材');
  console.log('   - 系统会自动推荐合适的菜谱');
  console.log(' ');
  console.log('🍽️ 开始烹饪吧！');
});
