const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
  skip: (req) => {
    return req.path === '/health';
  }
});

const strictRateLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: {
    success: false,
    error: 'AI request limit exceeded, please wait',
    code: 'AI_RATE_LIMIT_EXCEEDED'
  }
});

module.exports = { rateLimiter, strictRateLimiter };
