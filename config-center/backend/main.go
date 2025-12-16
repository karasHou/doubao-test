package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	_ "github.com/lib/pq"
	"github.com/gorilla/mux"
	"github.com/go-redis/redis/v8"
	"context"
)

// 全局变量
var db *sql.DB
var rdb *redis.Client
var ctx context.Context

// 配置项结构体
type ConfigItem struct {
	ID           int       `json:"id"`
	AppID        string    `json:"app_id"`
	Namespace    string    `json:"namespace"`
	Key          string    `json:"key"`
	Value        string    `json:"value"`
	Description  string    `json:"description"`
	Version      int       `json:"version"`
	IsActive     bool      `json:"is_active"`
	GrayRelease  bool      `json:"gray_release"`
	GrayRules    string    `json:"gray_rules"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// 版本历史结构体
type ConfigVersion struct {
	ID          int       `json:"id"`
	ConfigID    int       `json:"config_id"`
	Version     int       `json:"version"`
	Value       string    `json:"value"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

// 初始化数据库连接
func initDB() error {
	// PostgreSQL 连接字符串
	connStr := "user=postgres password=password dbname=config_center sslmode=disable"
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return err
	}

	// 测试连接
	err = db.Ping()
	return err
}

// 初始化 Redis 连接
func initRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // 没有密码
		DB:       0,  // 使用默认 DB
	})

	ctx = context.Background()
}

// 创建配置项
func createConfig(w http.ResponseWriter, r *http.Request) {
	var config ConfigItem
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 开始事务
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// 检查是否已有相同的配置项
	var existingVersion int
	err = tx.QueryRow(`
		SELECT COALESCE(MAX(version), 0)
		FROM config_items
		WHERE app_id = $1 AND namespace = $2 AND key = $3
	`, config.AppID, config.Namespace, config.Key).Scan(&existingVersion)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 新的版本号
	newVersion := existingVersion + 1

	// 插入新的配置项
	err = tx.QueryRow(`
		INSERT INTO config_items (app_id, namespace, key, value, description, version, is_active, gray_release, gray_rules)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`, config.AppID, config.Namespace, config.Key, config.Value, config.Description,
		newVersion, config.IsActive, config.GrayRelease, config.GrayRules).
		Scan(&config.ID, &config.CreatedAt, &config.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 记录版本历史
	_, err = tx.Exec(`
		INSERT INTO config_versions (config_id, version, value, description)
		VALUES ($1, $2, $3, $4)
	`, config.ID, newVersion, config.Value, config.Description)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 清除缓存
	cacheKey := fmt.Sprintf("config:%s:%s:%s", config.AppID, config.Namespace, config.Key)
	rdb.Del(ctx, cacheKey)

	// 返回响应
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(config)
}

// 获取配置项列表
func getConfigs(w http.ResponseWriter, r *http.Request) {
	// 获取查询参数
	appID := r.URL.Query().Get("app_id")
	namespace := r.URL.Query().Get("namespace")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	size, _ := strconv.Atoi(r.URL.Query().Get("size"))

	if page <= 0 {
		page = 1
	}
	if size <= 0 {
		size = 10
	}

	offset := (page - 1) * size

	// 构建查询语句
	query := `
		SELECT id, app_id, namespace, key, value, description, version, is_active, gray_release, gray_rules, created_at, updated_at
		FROM config_items
		WHERE 1=1
	`
	args := []interface{}{}

	if appID != "" {
		query += " AND app_id = $" + strconv.Itoa(len(args)+1)
		args = append(args, appID)
	}

	if namespace != "" {
		query += " AND namespace = $" + strconv.Itoa(len(args)+1)
		args = append(args, namespace)
	}

	query += " ORDER BY created_at DESC LIMIT $" + strconv.Itoa(len(args)+1) + " OFFSET $" + strconv.Itoa(len(args)+2)
	args = append(args, size, offset)

	// 执行查询
	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// 处理结果
	var configs []ConfigItem
	for rows.Next() {
		var config ConfigItem
		if err := rows.Scan(&config.ID, &config.AppID, &config.Namespace, &config.Key, &config.Value, &config.Description,
			&config.Version, &config.IsActive, &config.GrayRelease, &config.GrayRules, &config.CreatedAt, &config.UpdatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		configs = append(configs, config)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 返回响应
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(configs)
}

// 获取单个配置项
func getConfig(w http.ResponseWriter, r *http.Request) {
	// 从URL中获取参数
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid config ID", http.StatusBadRequest)
		return
	}

	// 查询配置项
	var config ConfigItem
	err = db.QueryRow(`
		SELECT id, app_id, namespace, key, value, description, version, is_active, gray_release, gray_rules, created_at, updated_at
		FROM config_items
		WHERE id = $1
	`, id).Scan(&config.ID, &config.AppID, &config.Namespace, &config.Key, &config.Value, &config.Description,
		&config.Version, &config.IsActive, &config.GrayRelease, &config.GrayRules, &config.CreatedAt, &config.UpdatedAt)

	if err == sql.ErrNoRows {
		http.NotFound(w, r)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 返回响应
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(config)
}

// 更新配置项
func updateConfig(w http.ResponseWriter, r *http.Request) {
	// 从URL中获取参数
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid config ID", http.StatusBadRequest)
		return
	}

	// 解析请求体
	var config ConfigItem
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	config.ID = id

	// 开始事务
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// 检查当前版本
	var currentVersion int
	err = tx.QueryRow(`
		SELECT version FROM config_items WHERE id = $1
	`, config.ID).Scan(&currentVersion)

	if err == sql.ErrNoRows {
		http.NotFound(w, r)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 新的版本号
	newVersion := currentVersion + 1

	// 更新配置项
	_, err = tx.Exec(`
		UPDATE config_items
		SET value = $1, description = $2, version = $3, is_active = $4,
			gray_release = $5, gray_rules = $6, updated_at = CURRENT_TIMESTAMP
		WHERE id = $7
	`, config.Value, config.Description, newVersion, config.IsActive,
		config.GrayRelease, config.GrayRules, config.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 记录版本历史
	_, err = tx.Exec(`
		INSERT INTO config_versions (config_id, version, value, description)
		VALUES ($1, $2, $3, $4)
	`, config.ID, newVersion, config.Value, config.Description)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 重新查询更新后的配置项
	err = tx.QueryRow(`
		SELECT id, app_id, namespace, key, value, description, version, is_active, gray_release, gray_rules, created_at, updated_at
		FROM config_items
		WHERE id = $1
	`, config.ID).Scan(&config.ID, &config.AppID, &config.Namespace, &config.Key, &config.Value, &config.Description,
		&config.Version, &config.IsActive, &config.GrayRelease, &config.GrayRules, &config.CreatedAt, &config.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 清除缓存
	cacheKey := fmt.Sprintf("config:%s:%s:%s", config.AppID, config.Namespace, config.Key)
	rdb.Del(ctx, cacheKey)

	// 返回响应
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(config)
}

// 删除配置项
func deleteConfig(w http.ResponseWriter, r *http.Request) {
	// 从URL中获取参数
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid config ID", http.StatusBadRequest)
		return
	}

	// 开始事务
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// 查询配置项信息用于清除缓存
	var appID, namespace, key string
	err = tx.QueryRow(`
		SELECT app_id, namespace, key FROM config_items WHERE id = $1
	`, id).Scan(&appID, &namespace, &key)

	if err == sql.ErrNoRows {
		http.NotFound(w, r)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 删除配置项
	_, err = tx.Exec(`DELETE FROM config_items WHERE id = $1`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 清除缓存
	cacheKey := fmt.Sprintf("config:%s:%s:%s", appID, namespace, key)
	rdb.Del(ctx, cacheKey)

	// 返回响应
	w.WriteHeader(http.StatusNoContent)
}

// 客户端拉取配置
func pullConfig(w http.ResponseWriter, r *http.Request) {
	// 获取查询参数
	appID := r.URL.Query().Get("app_id")
	namespace := r.URL.Query().Get("namespace")
	key := r.URL.Query().Get("key")
	clientInfo := r.URL.Query().Get("client_info") // 用于灰度发布的客户端信息

	if appID == "" || namespace == "" || key == "" {
		http.Error(w, "Missing required parameters", http.StatusBadRequest)
		return
	}

	// 构建缓存键
	cacheKey := fmt.Sprintf("config:%s:%s:%s", appID, namespace, key)

	// 尝试从缓存获取
	cachedValue, err := rdb.Get(ctx, cacheKey).Result()
	if err == nil && cachedValue != "" {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cachedValue))
		return
	}

	// 从数据库查询
	var config ConfigItem
	err = db.QueryRow(`
		SELECT id, app_id, namespace, key, value, description, version, is_active, gray_release, gray_rules, created_at, updated_at
		FROM config_items
		WHERE app_id = $1 AND namespace = $2 AND key = $3 AND is_active = TRUE
	`, appID, namespace, key).Scan(&config.ID, &config.AppID, &config.Namespace, &config.Key, &config.Value, &config.Description,
		&config.Version, &config.IsActive, &config.GrayRelease, &config.GrayRules, &config.CreatedAt, &config.UpdatedAt)

	if err == sql.ErrNoRows {
		http.NotFound(w, r)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 处理灰度发布
	if config.GrayRelease && clientInfo != "" {
		// 这里可以实现更复杂的灰度规则匹配逻辑
		// 简单示例：检查客户端信息是否包含特定标识
		if contains(clientInfo, "beta") || contains(clientInfo, "test") {
			// 返回灰度版本的配置
		}
	}

	// 将结果存入缓存，有效期5分钟
	configJSON, _ := json.Marshal(config)
	rdb.Set(ctx, cacheKey, string(configJSON), 5*time.Minute)

	// 返回响应
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(config)
}

// 获取配置版本历史
func getConfigVersions(w http.ResponseWriter, r *http.Request) {
	// 从URL中获取参数
	vars := mux.Vars(r)
	configID, err := strconv.Atoi(vars["config_id"])
	if err != nil {
		http.Error(w, "Invalid config ID", http.StatusBadRequest)
		return
	}

	// 查询版本历史
	rows, err := db.Query(`
		SELECT id, config_id, version, value, description, created_at
		FROM config_versions
		WHERE config_id = $1
		ORDER BY version DESC
	`, configID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// 处理结果
	var versions []ConfigVersion
	for rows.Next() {
		var version ConfigVersion
		if err := rows.Scan(&version.ID, &version.ConfigID, &version.Version, &version.Value, &version.Description, &version.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		versions = append(versions, version)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 返回响应
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(versions)
}

// 辅助函数：检查字符串是否包含子字符串
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (len(substr) == 0 || indexOf(s, substr) >= 0)
}

// 辅助函数：查找子字符串在字符串中的位置
func indexOf(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}

func main() {
	// 初始化数据库连接
	err := initDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Successfully connected to database")

	// 初始化 Redis 连接
	initRedis()
	_, err = rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Successfully connected to Redis")

	// 初始化路由
	r := mux.NewRouter()

	// API 路由
	r.HandleFunc("/api/configs", createConfig).Methods("POST")
	r.HandleFunc("/api/configs", getConfigs).Methods("GET")
	r.HandleFunc("/api/configs/{id}", getConfig).Methods("GET")
	r.HandleFunc("/api/configs/{id}", updateConfig).Methods("PUT")
	r.HandleFunc("/api/configs/{id}", deleteConfig).Methods("DELETE")
	r.HandleFunc("/api/configs/pull", pullConfig).Methods("GET")
	r.HandleFunc("/api/configs/{config_id}/versions", getConfigVersions).Methods("GET")

	// 启用 CORS
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	})

	// 启动服务器
	log.Println("Starting server on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}