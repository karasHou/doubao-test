import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

/**
 * Redis 缓存模块
 * 全局模块，所有其他模块可以直接注入 Cache 服务
 */
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          password: process.env.REDIS_PASSWORD || undefined,
          database: parseInt(process.env.REDIS_DB || '0', 10),
        }),
        // 全局缓存默认 TTL (秒)
        ttl: 60 * 5, // 5 分钟
        // 是否缓存 null 值
        storeNullValues: false,
      }),
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
