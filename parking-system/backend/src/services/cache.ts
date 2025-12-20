import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error:', err));

let isConnected = false;

const connectRedis = async () => {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log('Connected to Redis');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }
};

export const cacheData = async (key: string, data: any, expiration: number) => {
  await connectRedis();
  try {
    await client.setEx(key, expiration, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

export const getCachedData = async (key: string) => {
  await connectRedis();
  try {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};