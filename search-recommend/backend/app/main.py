from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="Search and Recommendation System", version="1.0.0")

# 允许跨域请求（前端Vue3调用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 模拟数据存储
class MockDatabase:
    def __init__(self):
        self.items = [
            {"id": 1, "title": "Python编程入门", "category": "编程", "content": "Python基础教程", "click_count": 150},
            {"id": 2, "title": "Java高级特性", "category": "编程", "content": "Java深入学习", "click_count": 120},
            {"id": 3, "title": "JavaScript异步编程", "category": "编程", "content": "Promise和async/await", "click_count": 180},
            {"id": 4, "title": "数据结构与算法", "category": "计算机基础", "content": "常用算法实现", "click_count": 200},
            {"id": 5, "title": "机器学习基础", "category": "人工智能", "content": "监督学习和无监督学习", "click_count": 250},
            {"id": 6, "title": "深度学习实战", "category": "人工智能", "content": "TensorFlow和PyTorch", "click_count": 300},
            {"id": 7, "title": "MySQL数据库优化", "category": "数据库", "content": "索引和查询优化", "click_count": 100},
            {"id": 8, "title": "Redis缓存设计", "category": "数据库", "content": "高性能缓存架构", "click_count": 130},
        ]

        self.search_history = []  # 存储搜索历史，用于热词统计
        self.click_history = []   # 存储点击历史，用于推荐

db = MockDatabase()

# 搜索功能 - 根据关键词匹配标题和内容
@app.get("/api/search", summary="搜索功能")
def search(
    q: str = Query(..., min_length=1, description="搜索关键词"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=50, description="每页数量")
):
    # 记录搜索历史
    db.search_history.append({
        "keyword": q,
        "timestamp": datetime.now().isoformat()
    })

    # 简单的模糊匹配
    results = []
    q_lower = q.lower()

    for item in db.items:
        title_match = q_lower in item["title"].lower()
        content_match = q_lower in item["content"].lower()
        category_match = q_lower in item["category"].lower()

        if title_match or content_match or category_match:
            # 计算简单的相关性得分
            score = 0
            if title_match:
                score += 5
            if content_match:
                score += 3
            if category_match:
                score += 2

            results.append({
                **item,
                "score": score
            })

    # 按相关性得分降序排序
    results.sort(key=lambda x: x["score"], reverse=True)

    # 分页
    start = (page - 1) * size
    end = start + size
    paged_results = results[start:end]

    return {
        "code": 200,
        "message": "success",
        "data": {
            "total": len(results),
            "page": page,
            "size": size,
            "results": paged_results
        }
    }

# 热词统计 - 返回搜索次数最多的关键词
@app.get("/api/hot-words", summary="热词统计")
def get_hot_words(
    limit: int = Query(10, ge=1, le=50, description="返回数量")
):
    # 统计每个关键词的搜索次数
    word_counts = {}
    for record in db.search_history:
        keyword = record["keyword"]
        word_counts[keyword] = word_counts.get(keyword, 0) + 1

    # 按搜索次数降序排序
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)

    # 取前N个
    hot_words = [{"word": word, "count": count} for word, count in sorted_words[:limit]]

    return {
        "code": 200,
        "message": "success",
        "data": hot_words
    }

# 记录点击事件 - 用户点击某个搜索结果
@app.post("/api/click/{item_id}", summary="记录点击事件")
def record_click(item_id: int):
    # 找到对应的item
    item = next((x for x in db.items if x["id"] == item_id), None)
    if not item:
        return {
            "code": 404,
            "message": "Item not found"
        }

    # 记录点击历史
    db.click_history.append({
        "item_id": item_id,
        "item_title": item["title"],
        "category": item["category"],
        "timestamp": datetime.now().isoformat()
    })

    # 增加点击计数
    item["click_count"] += 1

    return {
        "code": 200,
        "message": "success"
    }

# 推荐功能 - 基于点击历史推荐相似内容
@app.get("/api/recommend", summary="推荐功能")
def get_recommendations(
    limit: int = Query(5, ge=1, le=20, description="推荐数量")
):
    if not db.click_history:
        # 如果没有点击历史，返回点击量最高的内容
        recommended = sorted(db.items, key=lambda x: x["click_count"], reverse=True)[:limit]
        return {
            "code": 200,
            "message": "success (no click history, using popular items)",
            "data": recommended
        }

    # 基于点击历史的简单推荐算法：
    # 1. 统计用户点击的分类分布
    category_counts = {}
    for click in db.click_history:
        category = click["category"]
        category_counts[category] = category_counts.get(category, 0) + 1

    # 2. 找到用户最感兴趣的分类
    if category_counts:
        top_category = max(category_counts.items(), key=lambda x: x[1])[0]
    else:
        top_category = None

    # 3. 在该分类中推荐点击量高的内容（排除用户已经点击过的）
    clicked_item_ids = {click["item_id"] for click in db.click_history}
    recommended = []

    for item in db.items:
        if item["id"] not in clicked_item_ids:
            if top_category and item["category"] == top_category:
                recommended.append(item)
            elif not top_category:
                recommended.append(item)

    # 按点击量排序
    recommended.sort(key=lambda x: x["click_count"], reverse=True)

    # 如果该分类下没有足够的推荐内容，补充其他分类的热门内容
    if len(recommended) < limit:
        remaining = limit - len(recommended)
        other_items = []
        for item in db.items:
            if item["id"] not in clicked_item_ids and (not top_category or item["category"] != top_category):
                other_items.append(item)
        other_items.sort(key=lambda x: x["click_count"], reverse=True)
        recommended.extend(other_items[:remaining])

    return {
        "code": 200,
        "message": "success",
        "data": recommended[:limit]
    }

# 健康检查
@app.get("/health", summary="健康检查")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
