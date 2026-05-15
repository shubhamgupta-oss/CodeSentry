const CryptoJS = require('crypto-js');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.defaultTTL = parseInt(process.env.CACHE_TTL_SECONDS) || 3600;
  }

  generateCacheKey(input, mode, options = {}) {
    const data = JSON.stringify({ input, mode, options });
    const hash = CryptoJS.SHA256(data).toString();
    return `codesentry:${mode}:${hash}`;
  }

  async get(key) {
    try {
      const client = getRedisClient();
      if (!client) {
        return null;
      }

      const cached = await client.get(key);
      if (cached) {
        logger.info(`Cache hit for key: ${key.substring(0, 50)}...`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const client = getRedisClient();
      if (!client) {
        return false;
      }

      await client.setEx(key, ttl, JSON.stringify(value));
      logger.info(`Cached result for key: ${key.substring(0, 50)}...`);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      const client = getRedisClient();
      if (!client) {
        return false;
      }

      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }
}

module.exports = new CacheService();
