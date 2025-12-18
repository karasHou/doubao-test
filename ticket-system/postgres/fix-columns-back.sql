-- 修改 users 表列名
ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;

-- 修改 tickets 表列名
ALTER TABLE tickets RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE tickets RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE tickets RENAME COLUMN "submitterId" TO submitter_id;
ALTER TABLE tickets RENAME COLUMN "assigneeId" TO assignee_id;
