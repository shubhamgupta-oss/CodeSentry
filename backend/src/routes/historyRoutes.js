const express = require('express');
const router = express.Router();
const History = require('../models/historyModel');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const userId = req.currentUser._id;
  const { mode, limit = 20, page = 1 } = req.query;
  
  const query = { userId };
  if (mode) {
    query.mode = mode;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const history = await History.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-input.code -input.diff -output')
    .lean();

  const total = await History.countDocuments(query);

  res.json({
    success: true,
    data: history,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const query = { _id: req.params.id, userId: req.currentUser._id };
  
  const history = await History.findOne(query).lean();
  
  if (!history) {
    return res.status(404).json({
      success: false,
      error: 'History item not found'
    });
  }

  res.json({
    success: true,
    data: history
  });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const query = { _id: req.params.id, userId: req.currentUser._id };
  
  const history = await History.findOneAndDelete(query);
  
  if (!history) {
    return res.status(404).json({
      success: false,
      error: 'History item not found'
    });
  }

  res.json({
    success: true,
    message: 'History item deleted'
  });
}));

module.exports = router;
