const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/repos', githubController.getUserRepos);

router.get('/repos/:owner/:repo/pulls', githubController.getPullRequests);
router.get('/repos/:owner/:repo/pulls/:pull_number', githubController.getPullRequestDetails);
router.get('/repos/:owner/:repo/pulls/:pull_number/diff', githubController.getPullRequestDiff);
router.get('/repos/:owner/:repo/pulls/:pull_number/files', githubController.getPullRequestFiles);

router.post('/fetch-pr', githubController.fetchPullRequestByUrl);
router.post('/pr-comment', githubController.postPullRequestComment);

module.exports = router;
