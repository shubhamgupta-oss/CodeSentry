const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { AppError } = require('./errorHandler');

const AUTH_COOKIE_NAME = 'codesentry_auth';
const OAUTH_STATE_COOKIE_NAME = 'github_oauth_state';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getJwtSecret = () => process.env.JWT_SECRET || process.env.SESSION_SECRET;

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return req.cookies?.[AUTH_COOKIE_NAME] || null;
};

const signAuthToken = (userId) => {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }

  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE_MS
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
};

const generateOAuthState = () => crypto.randomBytes(24).toString('hex');

const setOAuthStateCookie = (res, state) => {
  res.cookie(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000
  });
};

const readOAuthStateCookie = (req) => req.cookies?.[OAUTH_STATE_COOKIE_NAME] || null;

const clearOAuthStateCookie = (res) => {
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
};

const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return next();
    }

    const secret = getJwtSecret();
    if (!secret) {
      return next();
    }

    const payload = jwt.verify(token, secret);
    if (!payload?.userId) {
      return next();
    }

    const user = await User.findById(payload.userId);
    if (user) {
      req.user = payload;
      req.currentUser = user;
    }

    next();
  } catch (error) {
    next();
  }
};

const requireAuth = async (req, res, next) => {
  try {
    if (!req.currentUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    next();
  } catch (error) {
    next(new AppError('Authentication failed', 401, 'AUTH_FAILED'));
  }
};

const optionalAuth = async (req, res, next) => next();

module.exports = {
  AUTH_COOKIE_NAME,
  authenticate,
  clearAuthCookie,
  clearOAuthStateCookie,
  generateOAuthState,
  optionalAuth,
  readOAuthStateCookie,
  requireAuth,
  setAuthCookie,
  setOAuthStateCookie,
  signAuthToken
};
