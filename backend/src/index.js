require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const githubRoutes = require('./routes/githubRoutes');
const aiRoutes = require('./routes/aiRoutes');
const historyRoutes = require('./routes/historyRoutes');
const healthRoutes = require('./routes/healthRoutes');
const logger = require('./utils/logger');
const { authenticate } = require('./middleware/auth');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

app.use(authenticate);

app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/ai', rateLimiter, aiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/health', healthRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const { connectDB } = require('./config/database');
    const { connectRedis } = require('./config/redis');
    
    try {
      await connectDB();
    } catch (dbError) {
      logger.warn(`MongoDB unavailable at startup: ${dbError.message}`);
      logger.warn('Starting API in degraded mode (database-dependent endpoints may fail)');
    }
    await connectRedis();
    
    app.listen(PORT, () => {
      logger.info(`CodeSentry API running on port ${PORT}`);
      console.log(`🚀 CodeSentry API running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
