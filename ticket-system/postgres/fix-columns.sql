-- 修改 users 表列名
ALTER TABLE users RENAME COLUMN created_at TO "createdAt";
ALTER TABLE users RENAME COLUMN updated_at TO "updatedAt";

-- 修改 tickets 表列名
ALTER TABLE tickets RENAME COLUMN created_at TO "createdAt";
ALTER TABLE tickets RENAME COLUMN updated_at TO "updatedAt";
ALTER TABLE tickets RENAME COLUMN submitter_id TO "submitterId";
ALTER TABLE tickets RENAME COLUMN assignee_id TO "assigneeId";
