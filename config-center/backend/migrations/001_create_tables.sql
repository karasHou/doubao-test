-- 创建配置项表
CREATE TABLE IF NOT EXISTS config_items (
    id SERIAL PRIMARY KEY,
    app_id VARCHAR(255) NOT NULL,
    namespace VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    gray_release BOOLEAN NOT NULL DEFAULT FALSE,
    gray_rules TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建配置项的唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_config_items_unique ON config_items (app_id, namespace, key);

-- 创建配置版本历史表
CREATE TABLE IF NOT EXISTS config_versions (
    id SERIAL PRIMARY KEY,
    config_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_id) REFERENCES config_items (id) ON DELETE CASCADE
);

-- 创建配置版本的唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_config_versions_unique ON config_versions (config_id, version);