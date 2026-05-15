import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 429) {
        throw new Error(data.error || 'Rate limit exceeded. Please wait a moment.');
      } else if (status === 413) {
        throw new Error('Input too large. Please reduce the input size.');
      } else if (status === 503) {
        throw new Error('AI service temporarily unavailable.');
      }
      
      throw new Error(data.error || 'An error occurred');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
);

export const authService = {
  initiateGitHubAuth: async () => {
    const response = await api.get('/auth/github');
    console.log('GitHub Auth URL:', response.data.authUrl);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export const githubService = {
  getRepos: async () => {
    const response = await api.get('/github/repos');
    return response.data;
  },
  
  getPullRequests: async (owner, repo, state = 'open') => {
    const response = await api.get(`/github/repos/${owner}/${repo}/pulls`, {
      params: { state }
    });
    return response.data;
  },
  getPullRequestDetails: async (owner, repo, prNumber) => {
    const response = await api.get(`/github/repos/${owner}/${repo}/pulls/${prNumber}`);
    return response.data;
  },
  
  getPullRequestDiff: async (owner, repo, prNumber) => {
    const response = await api.get(`/github/repos/${owner}/${repo}/pulls/${prNumber}/diff`);
    return response.data;
  },
  
  getPullRequestFiles: async (owner, repo, prNumber) => {
    const response = await api.get(`/github/repos/${owner}/${repo}/pulls/${prNumber}/files`);
    return response.data;
  },

  fetchPullRequestByUrl: async (prUrl) => {
    const response = await api.post('/github/fetch-pr', { prUrl });
    return response.data;
  },

  postPullRequestComment: async (prUrl, comment, reviewId) => {
    const response = await api.post('/github/pr-comment', { prUrl, comment, reviewId });
    return response.data;
  }
};

export const aiService = {
  codeReview: async (code, language, options = {}, diff = null, prInfo = null) => {
    const response = await api.post('/ai/code-review', {
      code,
      language,
      options,
      diff,
      prInfo
    });
    return response.data;
  },
  
  debug: async (code, error, language) => {
    const response = await api.post('/ai/debug', {
      code,
      error,
      language
    });
    return response.data;
  },
  
  generateTests: async (params) => {
    const response = await api.post('/ai/generate-tests', params);
    return response.data;
  },
  
  analyzePR: async (diff, repo, prNumber, context) => {
    const response = await api.post('/ai/analyze-pr', {
      diff,
      repo,
      prNumber,
      context
    });
    return response.data;
  },
  
  reviewRepository: async (repositoryPath, language, analysisTypes) => {
    const response = await api.post('/ai/review-repo', {
      repositoryPath,
      language,
      analysisTypes
    });
    return response.data;
  }
};

export const historyService = {
  getHistory: async (params = {}) => {
    const response = await api.get('/history', { params });
    return response.data;
  },
  
  getHistoryItem: async (id) => {
    const response = await api.get(`/history/${id}`);
    return response.data;
  },
  
  deleteHistoryItem: async (id) => {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  }
};

export const healthService = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
