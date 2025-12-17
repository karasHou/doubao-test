-- 初始化数据库脚本

-- 创建扩展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 数据库已通过 Sequelize 自动创建
-- 此脚本用于预先创建一些示例数据

-- 示例用户数据
INSERT INTO "Users" (username, email, password, name, role, "createdAt", "updatedAt")
VALUES
('admin', 'admin@example.com', '$2a$10$9kMafNRxxbjsJEjHc2lSWOHUwFVi0.7gQiobab9a9sav350K/q.nC', '管理员', 'admin', NOW(), NOW()),
('user1', 'user1@example.com', '$2a$10$9kMafNRxxbjsJEjHc2lSWOHUwFVi0.7gQiobab9a9sav350K/q.nC', '用户1', 'user', NOW(), NOW()),
('user2', 'user2@example.com', '$2a$10$9kMafNRxxbjsJEjHc2lSWOHUwFVi0.7gQiobab9a9sav350K/q.nC', '用户2', 'user', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 示例会议室数据
INSERT INTO "MeetingRooms" (name, capacity, equipment, location, status, "createdAt", "updatedAt")
VALUES
('会议室A', 15, '["投影仪", "音响", "白板"]', '1楼', 'available', NOW(), NOW()),
('会议室B', 8, '["投影仪", "白板"]', '2楼', 'available', NOW(), NOW()),
('会议室C', 20, '["投影仪", "音响", "白板", "视频会议设备"]', '3楼', 'available', NOW(), NOW()),
('小型讨论室', 4, '["白板"]', '1楼', 'available', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 示例会议数据
INSERT INTO "Meetings" (title, description, "startTime", "endTime", status, "roomId", "organizerId", "createdAt", "updatedAt")
VALUES
('团队周会', '讨论本周工作进展和下周计划', NOW() + INTERVAL '1 day' + INTERVAL '9 hour', NOW() + INTERVAL '1 day' + INTERVAL '10 hour', 'scheduled', 1, 1, NOW(), NOW()),
('项目评审会', '评审项目阶段性成果', NOW() + INTERVAL '2 days' + INTERVAL '14 hour', NOW() + INTERVAL '2 days' + INTERVAL '16 hour', 'scheduled', 3, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;