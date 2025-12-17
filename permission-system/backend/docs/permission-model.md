# 权限系统数据模型设计

## 1. 模型概述

本系统采用 RBAC (基于角色的访问控制) + ABAC (基于属性的访问控制) 混合模型，支持：
- 静态角色权限分配
- 动态属性策略控制
- 权限快照缓存

## 2. 数据库表结构

### 2.1 用户表 (users)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(255),
  status SMALLINT DEFAULT 1, -- 1: 启用, 0: 禁用
  properties JSONB DEFAULT '{}', -- ABAC 用户属性
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 角色表 (roles)
```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  status SMALLINT DEFAULT 1, -- 1: 启用, 0: 禁用
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 权限表 (permissions)
```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type SMALLINT NOT NULL, -- 1: 菜单权限, 2: 按钮权限, 3: API 权限
  category VARCHAR(50), -- 权限分类
  description TEXT,
  parent_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  path VARCHAR(255), -- 菜单路径/API 路径
  component VARCHAR(255), -- 前端组件路径
  icon VARCHAR(50), -- 菜单图标
  sort_order INTEGER DEFAULT 0,
  status SMALLINT DEFAULT 1, -- 1: 启用, 0: 禁用
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.4 用户角色关联表 (user_roles)
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role_id)
);
```

### 2.5 角色权限关联表 (role_permissions)
```sql
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);
```

### 2.6 ABAC 策略表 (policies)
```sql
CREATE TABLE policies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  effect VARCHAR(10) NOT NULL DEFAULT 'allow', -- allow | deny
  conditions JSONB NOT NULL, -- ABAC 策略条件
  actions JSONB NOT NULL, -- 允许的操作
  resources JSONB NOT NULL, -- 资源
  description TEXT,
  status SMALLINT DEFAULT 1, -- 1: 启用, 0: 禁用
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.7 用户策略关联表 (user_policies)
```sql
CREATE TABLE user_policies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  policy_id INTEGER REFERENCES policies(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, policy_id)
);
```

### 2.8 角色策略关联表 (role_policies)
```sql
CREATE TABLE role_policies (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  policy_id INTEGER REFERENCES policies(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, policy_id)
);
```

## 3. 数据关系图

```
+----------------+     +----------------+     +------------------+
|     users      |-----|   user_roles   |-----|      roles       |
+----------------+     +----------------+     +------------------+
         |                       |                       |
         |                       |                       |
         |                       |                       v
         |                       |                +------------------+
         |                       |                | role_permissions |
         |                       |                +------------------+
         |                       |                       |
         |                       |                       v
         |                       |                +------------------+
         |                       |                |  permissions     |
         |                       |                +------------------+
         |                       |
         |                       v
         |                +----------------+     +------------------+
         |                | user_policies  |-----|     policies     |
         |                +----------------+     +------------------+
         |                                         ^
         |                                         |
         |                                  +------------------+
         |                                  | role_policies    |
         |                                  +------------------+
         |
         v
+----------------+
| user_snapshots |  -- 权限快照缓存表
+----------------+
```

## 4. 核心数据结构

### 4.1 权限快照结构 (Redis 存储)
```typescript
interface PermissionSnapshot {
  userId: number;
  roles: Role[];
  permissions: Permission[];
  policies: Policy[];
  createdAt: number;
  expiresAt: number;
}
```

### 4.2 ABAC 策略条件结构
```typescript
interface PolicyCondition {
  attribute: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notin' | 'contains';
  value: any;
}
```

### 4.3 ABAC 策略评估上下文
```typescript
interface PolicyEvaluationContext {
  user: {
    id: number;
    username: string;
    properties: Record<string, any>;
  };
  action: string;
  resource: string;
  environment: {
    ip: string;
    userAgent: string;
    timestamp: number;
    [key: string]: any;
  };
}
```

## 5. 索引设计

为了提高查询性能，需要创建以下索引：

```sql
-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- 角色表索引
CREATE INDEX idx_roles_code ON roles(code);
CREATE INDEX idx_roles_status ON roles(status);

-- 权限表索引
CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_permissions_type ON permissions(type);
CREATE INDEX idx_permissions_parent_id ON permissions(parent_id);
CREATE INDEX idx_permissions_status ON permissions(status);

-- 关联表复合索引
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_user_policies_user_id ON user_policies(user_id);
CREATE INDEX idx_user_policies_policy_id ON user_policies(policy_id);
CREATE INDEX idx_role_policies_role_id ON role_policies(role_id);
CREATE INDEX idx_role_policies_policy_id ON role_policies(policy_id);

-- 策略表索引
CREATE INDEX idx_policies_code ON policies(code);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_effect ON policies(effect);
```