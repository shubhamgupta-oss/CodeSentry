const User = require('../models/userModel');
const githubService = require('../services/githubService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const {
  clearAuthCookie,
  clearOAuthStateCookie,
  generateOAuthState,
  readOAuthStateCookie,
  setAuthCookie,
  setOAuthStateCookie,
  signAuthToken
} = require('../middleware/auth');

const initiateGitHubAuth = asyncHandler(async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.CLIENT_URL}/auth/github/callback`;
  const scope = 'repo user';
  const state = generateOAuthState();
  setOAuthStateCookie(res, state);

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

  res.json({
    success: true,
    authUrl: githubAuthUrl
  });
});

const handleGitHubCallback = asyncHandler(async (req, res) => {
  // Support both GET (GitHub redirect) and POST (frontend request)
  const code = req.query.code || req.body.code;
  const error = req.query.error || req.body.error;
  const state = req.query.state || req.body.state;
  const expectedState = readOAuthStateCookie(req);
  const isPostRequest = req.method === 'POST';

  if (error) {
    logger.warn('GitHub OAuth error:', error);
    if (isPostRequest) {
      return res.status(400).json({ success: false, error });
    }
    return res.redirect(`${process.env.CLIENT_URL}?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    const errorMsg = 'No code received';
    logger.warn(errorMsg);
    if (isPostRequest) {
      return res.status(400).json({ success: false, error: errorMsg });
    }
    return res.redirect(`${process.env.CLIENT_URL}?error=${encodeURIComponent(errorMsg)}`);
  }
  
  if (!state || !expectedState || state !== expectedState) {
    logger.warn('OAuth state mismatch');
    if (isPostRequest) {
      return res.status(400).json({ success: false, error: 'Invalid OAuth state' });
    }
    return res.redirect(`${process.env.CLIENT_URL}?error=${encodeURIComponent('Invalid OAuth state')}`);
  }

  try {
    const tokenData = await githubService.exchangeCodeForToken(code);
    const { access_token } = tokenData;

    const githubUser = await githubService.getUserProfile(access_token);

    let user = await User.findOne({ 'github.id': githubUser.id });

    if (user) {
      user.github.accessToken = access_token;
      user.github.refreshToken = tokenData.refresh_token;
      user.github.username = githubUser.login;
      user.github.avatar = githubUser.avatar_url;
      user.github.name = githubUser.name;
      user.github.email = githubUser.email || user.github.email;
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        github: {
          id: githubUser.id,
          username: githubUser.login,
          avatar: githubUser.avatar_url,
          name: githubUser.name,
          email: githubUser.email,
          accessToken: access_token,
          refreshToken: tokenData.refresh_token
        },
        plan: 'free',
        usage: {
          reviewsUsed: 0,
          reviewsLimit: 10,
          lastReset: new Date()
        }
      });
      await user.save();
    }

    const userId = user._id.toString();
    const authToken = signAuthToken(userId);
    setAuthCookie(res, authToken);
    clearOAuthStateCookie(res);
    logger.info(`User logged in: ${user.github.username} (${userId})`);

    if (isPostRequest) {
      return res.json({ success: true, token: authToken, user: user.toJSON() });
    }
    res.redirect(`${process.env.CLIENT_URL}/dashboard?auth=success`);
  } catch (error) {
    logger.error('GitHub OAuth callback error:', error);
    const errorMsg = 'Authentication failed';
    if (isPostRequest) {
      return res.status(500).json({ success: false, error: errorMsg });
    }
    res.redirect(`${process.env.CLIENT_URL}?error=${encodeURIComponent(errorMsg)}`);
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }

  res.json({
    success: true,
    user: req.currentUser.toJSON()
  });
});

const logout = asyncHandler(async (req, res) => {
  if (req.currentUser) {
    await User.findByIdAndUpdate(req.currentUser._id, {
      'github.accessToken': null,
      'github.refreshToken': null
    });
  }
  clearAuthCookie(res);

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

const getUserStats = asyncHandler(async (req, res) => {
  const user = req.currentUser;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }

  let githubStats = {
    publicRepos: 0,
    followers: 0,
    following: 0
  };

  if (user.github?.accessToken) {
    try {
      const ghUser = await githubService.getUserProfile(user.github.accessToken);
      githubStats = {
        publicRepos: ghUser.public_repos || 0,
        followers: ghUser.followers || 0,
        following: ghUser.following || 0
      };
    } catch (err) {
      logger.warn('Failed to fetch GitHub user stats:', err.message);
    }
  }

  res.json({
    success: true,
    stats: {
      plan: user.plan,
      usage: user.usage,
      github: githubStats,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
});

const getUserHistory = asyncHandler(async (req, res) => {
  const userId = req.currentUser?._id;
  const { limit = 50 } = req.query;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }

  const History = require('../models/historyModel');
  const history = await History.find({ userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('-output')
    .lean();

  const total = await History.countDocuments({ userId });
  const thisMonth = await History.countDocuments({
    userId,
    createdAt: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    }
  });
  const successful = await History.countDocuments({ userId, status: 'success' });
  const failed = await History.countDocuments({ userId, status: 'failed' });

  res.json({
    success: true,
    history,
    stats: {
      total,
      thisMonth,
      successful,
      failed,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0
    }
  });
});

module.exports = {
  initiateGitHubAuth,
  handleGitHubCallback,
  getCurrentUser,
  logout,
  getUserStats,
  getUserHistory
};
