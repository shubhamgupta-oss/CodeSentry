const axios = require('axios');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

class GitHubService {
  constructor() {
    this.baseUrl = 'https://api.github.com';
  }

  getHeaders(accessToken) {
    return {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        },
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (response.data.error) {
        throw new AppError(response.data.error_description || 'GitHub OAuth failed', 400, 'GITHUB_AUTH_FAILED');
      }

      return response.data;
    } catch (error) {
      logger.error('GitHub token exchange error:', error.message);
      throw new AppError('Failed to exchange code for token', 500, 'TOKEN_EXCHANGE_FAILED');
    }
  }

  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: this.getHeaders(accessToken)
      });
      return response.data;
    } catch (error) {
      logger.error('GitHub user profile error:', error.message);
      throw new AppError('Failed to fetch GitHub user profile', 500, 'PROFILE_FETCH_FAILED');
    }
  }

  async getUserRepos(accessToken, options = {}) {
    try {
      const { page = 1, per_page = 100, sort = 'updated' } = options;
      
      const response = await axios.get(`${this.baseUrl}/user/repos`, {
        headers: this.getHeaders(accessToken),
        params: { page, per_page, sort }
      });

      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        htmlUrl: repo.html_url,
        owner: {
          login: repo.owner.login,
          id: repo.owner.id,
          avatarUrl: repo.owner.avatar_url
        },
        defaultBranch: repo.default_branch,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at
      }));
    } catch (error) {
      logger.error('GitHub repos error:', error.message);
      throw new AppError('Failed to fetch repositories', 500, 'REPOS_FETCH_FAILED');
    }
  }

  async getPullRequests(accessToken, owner, repo, options = {}) {
    try {
      const { state = 'open', page = 1, per_page = 30 } = options;
      
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
        headers: this.getHeaders(accessToken),
        params: { state, page, per_page }
      });

      return response.data.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: {
          login: pr.user.login,
          avatar: pr.user.avatar_url
        },
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        htmlUrl: pr.html_url,
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha
        },
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha
        },
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files
      }));
    } catch (error) {
      logger.error('GitHub PRs error:', error.message);
      if (error.response?.status === 404) {
        throw new AppError('Repository not found or access denied', 404, 'REPO_NOT_FOUND');
      }
      throw new AppError('Failed to fetch pull requests', 500, 'PRS_FETCH_FAILED');
    }
  }

  async getPullRequestDetails(accessToken, owner, repo, prNumber) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers: this.getHeaders(accessToken)
      });

      const pr = response.data;
      return {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        user: {
          login: pr.user.login,
          avatar: pr.user.avatar_url
        },
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        htmlUrl: pr.html_url,
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha
        },
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha
        },
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        mergeable: pr.mergeable,
        mergeableState: pr.mergeable_state
      };
    } catch (error) {
      logger.error('GitHub PR details error:', error.message);
      if (error.response?.status === 404) {
        throw new AppError('Pull request not found', 404, 'PR_NOT_FOUND');
      }
      throw new AppError('Failed to fetch pull request details', 500, 'PR_DETAILS_FAILED');
    }
  }

  async getPullRequestDiff(accessToken, owner, repo, prNumber) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers: {
          ...this.getHeaders(accessToken),
          Accept: 'application/vnd.github.v3.diff'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('GitHub PR diff error:', error.message);
      throw new AppError('Failed to fetch pull request diff', 500, 'PR_DIFF_FAILED');
    }
  }

  async getPullRequestFiles(accessToken, owner, repo, prNumber) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
        headers: this.getHeaders(accessToken)
      });

      return response.data.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
        sha: file.sha
      }));
    } catch (error) {
      logger.error('GitHub PR files error:', error.message);
      throw new AppError('Failed to fetch pull request files', 500, 'PR_FILES_FAILED');
    }
  }
}

module.exports = new GitHubService();
