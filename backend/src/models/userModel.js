const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  github: {
    id: { type: String, unique: true },
    username: { type: String },
    avatar: { type: String },
    name: { type: String },
    email: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String }
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'team'],
    default: 'free'
  },
  usage: {
    reviewsUsed: { type: Number, default: 0 },
    reviewsLimit: { type: Number, default: 10 },
    testsGenerated: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'users'
});

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.github.accessToken;
  delete obj.github.refreshToken;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
