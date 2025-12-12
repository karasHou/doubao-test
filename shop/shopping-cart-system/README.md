# 电商购物车系统

基于 React + NestJS 的电商购物车系统，支持 SKU 多属性选择、价格策略引擎、跨品类优惠等功能。

## 功能特性

### 🛍️ 商品管理
- 支持多 SKU 商品
- SKU 属性组合（颜色、尺寸等）
- 实时库存查询
- 库存扣减与恢复

### 🎯 SKU 选择器
- 动态属性组合
- 智能库存提示
- 实时价格计算
- 直观的选择界面

### 🛒 购物车
- 添加/删除商品
- 修改商品数量
- 实时价格更新
- 优惠券支持

### 💰 价格策略引擎
- 满减优惠
- 满折优惠
- 直降优惠
- 折扣优惠
- 优惠券支持
- 跨品类优惠叠加

### 🔒 库存管理
- 实时库存查询
- 库存可用性检查
- 库存扣减与恢复
- 库存预警

## 技术栈

### 前端
- React 18
- TypeScript
- Axios
- React Scripts

### 后端
- NestJS
- TypeScript
- Express
- 内存数据存储（演示用）

## 项目结构

```
shopping-cart-system/
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── price-engine/   # 价格策略引擎
│   │   ├── products/        # 商品管理
│   │   ├── cart/            # 购物车管理
│   │   ├── shared/          # 共享类型和工具
│   │   ├── app.module.ts    # 应用模块
│   │   └── main.ts          # 应用入口
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React 前端
│   ├── src/
│   │   ├── components/      # React 组件
│   │   │   ├── SkuSelector.tsx
│   │   │   └── Cart.tsx
│   │   ├── services/        # API 服务
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── App.tsx          # 应用主组件
│   │   └── index.tsx        # 应用入口
│   ├── public/
│   │   └── index.html
│   └── package.json
├── start.sh                  # 启动脚本
└── README.md
```

## 快速开始

### 环境要求
- Node.js 16+
- npm 8+

### 方式一：使用启动脚本（推荐）

```bash
# 进入项目目录
cd shopping-cart-system

# 给启动脚本添加执行权限
chmod +x start.sh

# 启动前后端服务
./start.sh
```

### 方式二：手动启动

#### 1. 启动后端

```bash
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run start:dev
```

后端服务将在 `http://localhost:3000` 启动

#### 2. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端服务将在 `http://localhost:3001` 启动

## API 接口文档

### 商品接口

- `GET /products` - 获取所有商品
- `GET /products/:id` - 获取商品详情
- `GET /products/sku/:id` - 获取 SKU 详情
- `GET /products/stock/check` - 检查库存
- `GET /products/:id/sku-combinations` - 获取可用 SKU 组合
- `POST /products/stock/deduct` - 扣减库存
- `POST /products/stock/restore` - 恢复库存

### 购物车接口

- `GET /cart` - 获取购物车
- `POST /cart/items` - 添加商品到购物车
- `PUT /cart/items/:itemId` - 更新购物车商品数量
- `DELETE /cart/items/:itemId` - 删除购物车商品
- `DELETE /cart` - 清空购物车
- `POST /cart/coupons` - 应用优惠券
- `DELETE /cart/coupons/:couponId` - 移除优惠券
- `GET /cart/statistics` - 获取购物车统计

### 价格引擎接口

- `POST /price-engine/calculate` - 计算价格
- `GET /price-engine/promotions` - 获取所有促销规则
- `GET /price-engine/coupons` - 获取优惠券列表

## 示例数据

系统预置了以下示例数据：

### 商品
- iPhone 15 Pro (电子产品)
  - 颜色：黑色、白色、蓝色、红色
  - 存储容量：128GB、256GB、512GB、1TB

- 经典白T恤 (服装)
  - 颜色：白色、黑色、灰色、蓝色
  - 尺码：S、M、L、XL、XXL

### 促销规则
- P1: 满100减20（可叠加）
- P2: 满200打8折（可叠加，最高优惠50元）
- P3: 新人优惠券 10元（可叠加）
- P4: 电子产品9折（不可叠加）

## 使用说明

### 1. 浏览商品
- 访问前端页面 `http://localhost:3001`
- 浏览可用商品列表

### 2. 选择 SKU
- 点击商品进入详情页
- 使用 SKU 选择器选择属性（颜色、尺寸等）
- 系统会自动检查库存并显示实时价格

### 3. 添加到购物车
- 选择完 SKU 后，点击"添加到购物车"
- 可以在购物车页面查看和管理已添加的商品

### 4. 应用优惠
- 在购物车页面可以查看适用的促销规则
- 系统会自动应用最优的价格策略
- 可以手动添加优惠券代码

### 5. 结算
- 确认购物车商品和价格
- 点击结算完成购买流程

## 开发模式

### 后端开发
```bash
cd backend
npm run start:dev  # 启动开发服务器，支持热重载
```

### 前端开发
```bash
cd frontend
npm start  # 启动开发服务器，支持热重载
```

## 构建部署

### 构建后端
```bash
cd backend
npm run build
npm run start:prod
```

### 构建前端
```bash
cd frontend
npm run build
# 构建产物将生成在 build 目录
```

## 注意事项

1. **数据存储**：当前版本使用内存存储数据，重启服务后数据会丢失。生产环境建议使用数据库（如 PostgreSQL、MongoDB）。

2. **并发安全**：内存存储在高并发场景下存在线程安全问题，生产环境需要使用数据库事务或 Redis 锁来保证数据一致性。

3. **API 设计**：当前 API 设计为演示用途，生产环境需要添加认证（如 JWT）、授权、请求限流、日志记录等功能。

4. **错误处理**：当前版本的错误处理较为简单，生产环境需要更完善的错误处理机制和用户友好的错误提示。

5. **性能优化**：对于大量商品和 SKU 的场景，需要实现分页查询、缓存策略、数据库索引优化等性能优化措施。

## 扩展功能建议

1. **用户系统**：添加用户注册、登录、个人信息管理等功能。

2. **订单系统**：实现订单创建、支付、发货、收货、评价等完整的订单流程。

3. **支付集成**：集成第三方支付系统（如支付宝、微信支付、Stripe 等）。

4. **物流集成**：集成物流查询和跟踪功能。

5. **优惠券系统**：实现更复杂的优惠券规则（如限时优惠券、特定商品优惠券、裂变优惠券等）。

6. **推荐系统**：基于用户行为和偏好推荐商品。

7. **搜索功能**：实现商品搜索和过滤功能。

8. **数据统计**：添加销售统计、用户行为分析等数据统计功能。

9. **管理员后台**：实现商品管理、订单管理、用户管理、系统设置等管理员功能。

10. **多租户支持**：支持多个商家或品牌在同一个平台上运营。

## License

MIT
