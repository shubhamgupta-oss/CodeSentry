const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mode: {
    type: String,
    enum: ['code-review', 'debug', 'generate-tests', 'analyze-pr', 'repo-review'],
    required: true
  },
  input: {
    code: { type: String },
    error: { type: String },
    diff: { type: String },
    language: { type: String },
    framework: { type: String },
    repo: { type: String },
    prNumber: { type: Number }
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    model: { type: String, default: 'gpt-4o-mini' },
    tokensUsed: { type: Number, default: 0 },
    processingTime: { type: Number },
    cacheHit: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success'
  }
}, {
  timestamps: true,
  collection: 'history'
});

historySchema.index({ createdAt: -1 });
historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ mode: 1, createdAt: -1 });

const History = mongoose.model('History', historySchema);

module.exports = History;
