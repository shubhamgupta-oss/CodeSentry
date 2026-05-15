const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState
      },
      openai: {
        status: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
      },
      github: {
        status: process.env.GITHUB_CLIENT_ID ? 'configured' : 'not configured'
      }
    },
    environment: process.env.NODE_ENV || 'development'
  };

  const isHealthy = health.services.mongodb.status === 'connected';
  
  res.status(isHealthy ? 200 : 503).json(health);
});

router.get('/ready', async (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  
  if (isReady) {
    res.json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'Database not connected' });
  }
});

router.get('/live', (req, res) => {
  res.json({ alive: true });
});

module.exports = router;
