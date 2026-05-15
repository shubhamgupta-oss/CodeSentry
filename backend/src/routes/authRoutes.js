const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.get('/github', authController.initiateGitHubAuth);

router.get('/github/callback', authController.handleGitHubCallback);
router.post('/github/callback', authController.handleGitHubCallback);

router.get('/me', requireAuth, authController.getCurrentUser);
router.get('/stats', requireAuth, authController.getUserStats);
router.get('/history', requireAuth, authController.getUserHistory);

router.post('/logout', requireAuth, authController.logout);

module.exports = router;
