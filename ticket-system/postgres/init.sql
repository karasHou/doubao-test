-- 创建数据库（Docker Compose 已指定，这里可以做额外配置）
-- CREATE DATABASE IF NOT EXISTS ticket_system;

-- 创建扩展（如果需要）
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 插入初始数据

-- 插入管理员用户
INSERT INTO users (id, username, password, role, email, created_at, updated_at)
VALUES ('1', 'admin', 'admin', 'admin', 'admin@example.com', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- 插入客服用户
INSERT INTO users (id, username, password, role, email, created_at, updated_at)
VALUES ('2', 'cs001', 'cs001', 'customer_service', 'cs001@example.com', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- 插入普通用户
INSERT INTO users (id, username, password, role, email, created_at, updated_at)
VALUES ('3', 'user001', 'user001', 'user', 'user001@example.com', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- 插入示例工单
INSERT INTO tickets (id, title, description, status, priority, category, submitter_id, assignee_id, created_at, updated_at)
VALUES ('1', '登录页面无法加载', '用户反馈登录页面点击后没有任何反应，尝试了多种浏览器都不行', 'open', 'high', 'bug', '3', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO tickets (id, title, description, status, priority, category, submitter_id, assignee_id, created_at, updated_at)
VALUES ('2', '希望增加深色模式', '目前系统只有亮色模式，希望能增加深色模式，保护用户眼睛', 'in_progress', 'medium', 'feature', '3', '2', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO tickets (id, title, description, status, priority, category, submitter_id, assignee_id, created_at, updated_at)
VALUES ('3', '如何导出数据', '用户想知道如何导出工单数据，是否有批量导出功能', 'resolved', 'low', 'support', '3', '2', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
