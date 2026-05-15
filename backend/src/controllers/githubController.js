const githubService = require('../services/githubService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const getAuthenticatedUser = (req) => req.currentUser;

const getUserRepos = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || !user.github?.accessToken) {
    return res.status(401).json({
      success: false,
      error: 'GitHub not connected'
    });
  }

  const { page, per_page, sort } = req.query;
  
  const repos = await githubService.getUserRepos(user.github.accessToken, {
    page: parseInt(page) || 1,
    per_page: parseInt(per_page) || 100,
    sort: sort || 'updated'
  });

  res.json({
    success: true,
    repos
  });
});

const getPullRequests = asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;
  const user = getAuthenticatedUser(req);
  if (!user || !user.github?.accessToken) {
    return res.status(401).json({
      success: false,
      error: 'GitHub not connected'
    });
  }

  const { state, page, per_page } = req.query;
  
  const pulls = await githubService.getPullRequests(user.github.accessToken, owner, repo, {
    state: state || 'open',
    page: parseInt(page) || 1,
    per_page: parseInt(per_page) || 30
  });

  res.json({
    success: true,
    pulls
  });
});

const getPullRequestDetails = asyncHandler(async (req, res) => {
  const { owner, repo, pull_number } = req.params;
  const user = getAuthenticatedUser(req);
  if (!user || !user.github?.accessToken) {
    return res.status(401).json({
      success: false,
      error: 'GitHub not connected'
    });
  }

  const pr = await githubService.getPullRequestDetails(
    user.github.accessToken,
    owner,
    repo,
    parseInt(pull_number)
  );

  res.json({
    success: true,
    pullRequest: pr
  });
});

const getPullRequestDiff = asyncHandler(async (req, res) => {
  const { owner, repo, pull_number } = req.params;
  const user = getAuthenticatedUser(req);
  if (!user || !user.github?.accessToken) {
    return res.status(401).json({
      success: false,
      error: 'GitHub not connected'
    });
  }

  const diff = await githubService.getPullRequestDiff(
    user.github.accessToken,
    owner,
    repo,
    parseInt(pull_number)
  );

  res.json({
    success: true,
    diff
  });
});

const getPullRequestFiles = asyncHandler(async (req, res) => {
  const { owner, repo, pull_number } = req.params;
  const user = getAuthenticatedUser(req);
  if (!user || !user.github?.accessToken) {
    return res.status(401).json({
      success: false,
      error: 'GitHub not connected'
    });
  }

  const files = await githubService.getPullRequestFiles(
    user.github.accessToken,
    owner,
    repo,
    parseInt(pull_number)
  );

  res.json({
    success: true,
    files
  });
});

const fetchPullRequestByUrl = asyncHandler(async (req, res) => {
  const { prUrl } = req.body;
  const user = getAuthenticatedUser(req);
  if (!user || !user.github?.accessToken) {
    return res.status(401).json({
      success: false,
      error: 'GitHub not connected'
    });
  }

  // Parse PR URL: https://github.com/owner/repo/pull/123
  const prUrlMatch = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
  if (!prUrlMatch) {
    return res.status(400).json({
      success: false,
      error: 'Invalid PR URL format. Expected: https://github.com/owner/repo/pull/123'
    });
  }

  const [, owner, repo, prNumber] = prUrlMatch;
  const pullNumber = parseInt(prNumber);

  const [prDetails, diff] = await Promise.all([
    githubService.getPullRequestDetails(user.github.accessToken, owner, repo, pullNumber),
    githubService.getPullRequestDiff(user.github.accessToken, owner, repo, pullNumber)
  ]);

  res.json({
    success: true,
    pr: {
      number: pullNumber,
      title: prDetails.title,
      state: prDetails.state,
      user: prDetails.user,
      createdAt: prDetails.created_at,
      updatedAt: prDetails.updated_at,
      body: prDetails.body,
      additions: prDetails.additions,
      deletions: prDetails.deletions,
      changedFiles: prDetails.changed_files,
      url: prDetails.html_url
    },
    diff,
    owner,
    repo
  });
});

const postPullRequestComment = asyncHandler(async (req, res) => {
  const { prUrl, comment } = req.body;
  const user = getAuthenticatedUser(req);

  if (!comment || !comment.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Comment content is required'
    });
  }

  if (!user || !user.github?.accessToken) {
    return res.status(401).json({
      success: false,
      error: 'GitHub not connected'
    });
  }

  // Parse PR URL
  const prUrlMatch = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
  if (!prUrlMatch) {
    return res.status(400).json({
      success: false,
      error: 'Invalid PR URL format'
    });
  }

  const [, owner, repo, prNumber] = prUrlMatch;

  try {
    // Post comment using GitHub API
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.github.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'CodeSentry-App'
      },
      body: JSON.stringify({
        body: comment
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to post comment');
    }

    const commentData = await response.json();

    res.json({
      success: true,
      comment: {
        id: commentData.id,
        body: commentData.body,
        user: commentData.user,
        createdAt: commentData.created_at,
        url: commentData.html_url
      }
    });
  } catch (error) {
    logger.error('Failed to post PR comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to post comment. You may not have permission to comment on this PR.'
    });
  }
});

module.exports = {
  getUserRepos,
  getPullRequests,
  getPullRequestDetails,
  getPullRequestDiff,
  getPullRequestFiles,
  fetchPullRequestByUrl,
  postPullRequestComment
};
