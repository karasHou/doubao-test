#!/usr/bin/env python3
"""
游戏资源地图查询系统 - 模拟数据生成脚本
生成 10 万+ 资源点数据
"""

import random
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from faker import Faker

# 配置
NUM_RESOURCES = 100000  # 生成资源点数量
DB_HOST = 'localhost'
DB_PORT = 5432
DB_NAME = 'game_map'
DB_USER = 'postgres'
DB_PASSWORD = 'password'

# 资源类型和稀有度
RESOURCE_TYPES = ['plant', 'animal', 'mineral', 'task']
RESOURCE_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary']

# 中国主要城市坐标范围 (用于生成合理的地理位置)
CITY_COORDS = {
    'Beijing': (116.0, 39.5),
    'Shanghai': (121.0, 31.0),
    'Guangzhou': (113.0, 23.0),
    'Shenzhen': (114.0, 22.5),
    'Chengdu': (104.0, 30.5),
    'Hangzhou': (120.0, 30.0),
    'Wuhan': (114.0, 30.5),
    'Xian': (109.0, 34.0),
    'Chongqing': (106.5, 29.5),
    'Tianjin': (117.0, 39.0),
    'Nanjing': (118.5, 32.0),
    'Suzhou': (120.5, 31.3),
    'Zhengzhou': (113.7, 34.8),
    'Changsha': (113.0, 28.2)
}

# 资源名称模板
RESOURCE_NAMES = {
    'plant': ['{adj}草药', '{adj}花朵', '{adj}蘑菇', '{adj}灵芝', '{adj}人参'],
    'animal': ['{adj}野兔', '{adj}鹿', '{adj}熊', '{adj}虎', '{adj}狼', '{adj}鸟'],
    'mineral': ['{adj}铁矿', '{adj}铜矿', '{adj}银矿', '{adj}金矿', '{adj}宝石矿'],
    'task': ['{adj}任务', '{adj}挑战', '{adj}遗迹', '{adj}宝藏', '{adj}副本']
}

# 形容词列表
ADJECTIVES = ['普通的', '常见的', '稀有的', '珍贵的', '古老的', '神秘的', '强大的', '独特的']


def generate_resource(faker):
    """生成单个资源点数据"""
    resource_type = random.choice(RESOURCE_TYPES)
    rarity = random.choice(RESOURCE_RARITIES)
    level = random.randint(1, 100)

    # 生成名称
    name_template = random.choice(RESOURCE_NAMES[resource_type])
    adj = random.choice(ADJECTIVES)
    name = name_template.format(adj=adj)

    # 生成地理位置 (在中国主要城市附近)
    city, (base_lon, base_lat) = random.choice(list(CITY_COORDS.items()))
    # 在基础坐标附近随机偏移 (最大 2 度)
    lon = base_lon + random.uniform(-2.0, 2.0)
    lat = base_lat + random.uniform(-2.0, 2.0)
    # 确保坐标在中国范围内
    lon = max(73.0, min(135.0, lon))
    lat = max(18.0, min(54.0, lat))

    # 生成描述
    description = faker.text(max_nb_chars=200)

    # 生成数量
    quantity = random.randint(1, 100)

    return {
        'name': name,
        'type': resource_type,
        'rarity': rarity,
        'level': level,
        'description': description,
        'location': (lon, lat),
        'quantity': quantity
    }


def generate_data(num):
    """生成指定数量的资源数据"""
    faker = Faker('zh_CN')
    resources = []
    for _ in range(num):
        resources.append(generate_resource(faker))
    return resources


def save_to_json(resources, filename):
    """保存资源数据到 JSON 文件"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(resources, f, ensure_ascii=False, indent=2)


def import_to_postgres(resources):
    """将资源数据导入到 PostgreSQL 数据库"""
    try:
        # 连接数据库
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )

        cursor = conn.cursor()

        # 批量插入数据
        for resource in resources:
            lon, lat = resource['location']
            cursor.execute("""
                INSERT INTO resources (name, type, rarity, level, description, location, quantity)
                VALUES (%s, %s, %s, %s, %s, ST_GeogFromText(%s), %s)
            """, (
                resource['name'],
                resource['type'],
                resource['rarity'],
                resource['level'],
                resource['description'],
                f'POINT({lon} {lat})',
                resource['quantity']
            ))

        # 提交事务
        conn.commit()
        print(f"成功导入 {len(resources)} 条数据到 PostgreSQL")

    except Exception as e:
        print(f"导入数据到 PostgreSQL 失败: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


if __name__ == '__main__':
    print(f"开始生成 {NUM_RESOURCES} 个游戏资源点数据...")

    # 生成数据
    resources = generate_data(NUM_RESOURCES)

    # 保存到 JSON 文件
    save_to_json(resources, 'resources-data.json')
    print(f"数据已保存到 resources-data.json")

    # 导入到 PostgreSQL (可选，需要先创建数据库和表)
    # import_to_postgres(resources)

    print("数据生成完成!")
