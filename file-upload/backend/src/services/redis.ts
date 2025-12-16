import Redis from 'redis';
import config from '../config';

class RedisService {
  private client: Redis.RedisClientType;
  private connected = false;

  constructor() {
    this.client = Redis.createClient({
      url: config.redis.url
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
      this.connected = true;
    });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }

  async set(key: string, value: any, expiration?: number): Promise<void> {
    await this.connect();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    if (expiration) {
      await this.client.setEx(key, expiration, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async get(key: string): Promise<any | null> {
    await this.connect();
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async del(key: string): Promise<void> {
    await this.connect();
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    await this.connect();
    return (await this.client.exists(key)) === 1;
  }

  async sadd(key: string, member: string): Promise<void> {
    await this.connect();
    await this.client.sAdd(key, member);
  }

  async srem(key: string, member: string): Promise<void> {
    await this.connect();
    await this.client.sRem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    await this.connect();
    return this.client.sMembers(key);
  }

  async hset(key: string, field: string, value: any): Promise<void> {
    await this.connect();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.hSet(key, field, stringValue);
  }

  async hget(key: string, field: string): Promise<any | null> {
    await this.connect();
    const value = await this.client.hGet(key, field);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    await this.connect();
    const result = await this.client.hGetAll(key);
    const parsedResult: Record<string, any> = {};

    for (const [field, value] of Object.entries(result)) {
      try {
        parsedResult[field] = JSON.parse(value);
      } catch {
        parsedResult[field] = value;
      }
    }

    return parsedResult;
  }
}

export default new RedisService();