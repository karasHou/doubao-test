import { Injectable } from '@nestjs/common';

// 临时内存缓存，避免 Redis 构建问题
@Injectable()
export class CacheService {
  private cache = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get(key);
    return value || null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value);

    // 如果有 TTL，超时后自动删除
    if (ttl) {
      setTimeout(() => {
        this.cache.delete(key);
      }, ttl * 1000);
    }
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
