const redis = require('redis');

let client;

class CacheService {
  constructor() {
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      client.on('error', (err) => console.error('Redis Client Error', err));

      await client.connect();
      console.log('Redis connected');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }

  async get(key) {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, expirationSeconds = 3600) {
    try {
      const serializedValue = JSON.stringify(value);
      if (expirationSeconds) {
        await client.setEx(key, expirationSeconds, serializedValue);
      } else {
        await client.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key) {
    try {
      console.log('Deleting cache key:', key);
      if (key.includes('*')) {
        const keys = await client.keys(key);
        console.log('Found keys to delete:', keys);
        if (keys.length > 0) {
          const result = await client.del(keys);
          console.log('Deleted', result, 'keys');
        }
      } else {
        const result = await client.del(key);
        console.log('Deleted key:', key, 'result:', result);
      }
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async clear() {
    try {
      await client.flushAll();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
}

module.exports = new CacheService();