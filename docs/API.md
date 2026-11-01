# CodeSentry API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.your-domain.com/api
```

## Authentication

Protected routes use a JWT. After GitHub OAuth, the API sets an `HttpOnly` cookie named `codesentry_auth`. You can also send the same token as a bearer header:

```
Authorization: Bearer <jwt>
```

Cookie auth needs `credentials: include` on browser requests. AI routes accept anonymous calls. GitHub, history, and `/auth/me` require a signed-in user.

The token expires after 7 days. Set `JWT_SECRET` (or `SESSION_SECRET`) before starting the API.

## Endpoints

---

### Authentication

#### GET /auth/github
Initiate GitHub OAuth flow.

**Response:**
```json
{
  "success": true,
  "authUrl": "https://github.com/login/oauth/authorize?client_id=..."
}
```

#### GET /auth/github/callback
OAuth callback endpoint (handled by backend, redirects to frontend).

#### GET /auth/me
Get current authenticated user.

**Auth:** cookie or `Authorization: Bearer <jwt>`

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "github": {
      "id": "...",
      "username": "octocat",
      "avatar": "https://avatars.githubusercontent.com/...",
      "name": "GitHub User",
      "email": "user@example.com"
    },
    "plan": "free",
    "usage": {
      "reviewsUsed": 5,
      "reviewsLimit": 10,
      "lastReset": "2024-01-01T00:00:00.000Z"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-15T00:00:00.000Z"
  }
}
```

#### POST /auth/logout
Logout current user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GitHub Integration

#### GET /github/repos
List user's GitHub repositories.

**Auth:** required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 100)
- `sort` (optional): Sort by (updated, created, pushed, full_name)

**Response:**
```json
{
  "success": true,
  "repos": [
    {
      "id": 123456,
      "name": "my-project",
      "fullName": "octocat/my-project",
      "description": "My awesome project",
      "private": false,
      "htmlUrl": "https://github.com/octocat/my-project",
      "defaultBranch": "main",
      "language": "JavaScript",
      "stars": 42,
      "forks": 10,
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

#### GET /github/repos/:owner/:repo/pulls
List pull requests for a repository.

**Auth:** required

**Query Parameters:**
- `state` (optional): Filter by state (open, closed, all) - default: open
- `page` (optional): Page number
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "pulls": [
    {
      "number": 42,
      "title": "Add new feature",
      "state": "open",
      "user": {
        "login": "octocat",
        "avatar": "https://avatars.githubusercontent.com/..."
      },
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-16T00:00:00.000Z",
      "htmlUrl": "https://github.com/octocat/my-project/pull/42",
      "additions": 150,
      "deletions": 20,
      "changedFiles": 5
    }
  ]
}
```

#### GET /github/repos/:owner/:repo/pulls/:pull_number
Get detailed pull request information.

**Response:**
```json
{
  "success": true,
  "pullRequest": {
    "number": 42,
    "title": "Add new feature",
    "body": "This PR adds...",
    "state": "open",
    "user": {...},
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-16T00:00:00.000Z",
    "htmlUrl": "https://github.com/...",
    "additions": 150,
    "deletions": 20,
    "changedFiles": 5
  }
}
```

#### GET /github/repos/:owner/:repo/pulls/:pull_number/diff
Get the full diff of a pull request.

**Response:**
```json
{
  "success": true,
  "diff": "diff --git a/src/index.js b/src/index.js..."
}
```

#### GET /github/repos/:owner/:repo/pulls/:pull_number/files
Get the list of changed files in a PR.

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "src/index.js",
      "status": "modified",
      "additions": 50,
      "deletions": 10,
      "changes": 60,
      "patch": "--- a/src/index.js\n+++ b/src/index.js...",
      "sha": "abc123..."
    }
  ]
}
```

---

### AI Analysis

#### POST /ai/code-review
Analyze code for bugs, improvements, and complexity.

**Request:**
```json
{
  "code": "function add(a, b) {\n  return a + b;\n}",
  "language": "javascript",
  "options": {
    "includeComplexity": true,
    "includeSuggestions": true,
    "verbosity": "medium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "mode": "code-review",
  "data": {
    "bugs": [
      {
        "line": 2,
        "severity": "high",
        "description": "No type checking for inputs",
        "suggestion": "Add validation to ensure a and b are numbers"
      }
    ],
    "improvements": [
      {
        "line": 1,
        "type": "best-practice",
        "description": "Add JSDoc comments",
        "code": "/**\n * Adds two numbers\n * @param {number} a\n * @param {number} b\n * @returns {number}\n */"
      }
    ],
    "complexity": {
      "time": "O(1)",
      "space": "O(1)"
    },
    "summary": "Function is simple and efficient. Consider adding input validation."
  }
}
```

#### POST /ai/debug
Debug code and provide fixes.

**Request:**
```json
{
  "code": "console.log(undefinedVar.property)",
  "error": "TypeError: Cannot read property 'property' of undefined",
  "language": "javascript"
}
```

**Response:**
```json
{
  "success": true,
  "mode": "debug",
  "data": {
    "rootCause": "The variable 'undefinedVar' is not defined before use",
    "confidence": 95,
    "fix": {
      "description": "Define the variable before using it",
      "code": "const undefinedVar = { property: 'value' };\nconsole.log(undefinedVar.property);"
    },
    "explanation": "The error occurs because 'undefinedVar' is undefined..."
  }
}
```

#### POST /ai/generate-tests
Generate test cases for code.

**Request:**
```json
{
  "code": "function add(a, b) {\n  return a + b;\n}",
  "language": "javascript",
  "framework": "jest",
  "testType": "unit",
  "includeEdgeCases": true,
  "includeNegativeCases": true
}
```

**Response:**
```json
{
  "success": true,
  "mode": "generate-tests",
  "data": {
    "tests": [
      {
        "name": "adds two positive numbers",
        "type": "unit",
        "description": "Tests basic addition of two positive integers",
        "code": "describe('add', () => {\n  it('adds two positive numbers', () => {\n    expect(add(2, 3)).toBe(5);\n  });\n});"
      },
      {
        "name": "handles negative numbers",
        "type": "negative",
        "description": "Tests addition with negative numbers",
        "code": "describe('add', () => {\n  it('handles negative numbers', () => {\n    expect(add(-1, -1)).toBe(-2);\n  });\n});"
      }
    ],
    "framework": "jest",
    "summary": "Generated 8 test cases including unit, edge, and negative cases"
  }
}
```

#### POST /ai/analyze-pr
Analyze PR diff for risks and improvements.

**Request:**
```json
{
  "diff": "diff --git a/src/index.js...",
  "repo": "owner/repo",
  "prNumber": 42,
  "context": "Adding new authentication feature"
}
```

**Response:**
```json
{
  "success": true,
  "mode": "analyze-pr",
  "data": {
    "summary": "This PR adds authentication functionality",
    "riskAreas": [
      {
        "severity": "high",
        "description": "New endpoint lacks authentication middleware",
        "file": "src/index.js",
        "line": 15
      }
    ],
    "suggestions": [
      "Add authentication middleware to the new endpoint",
      "Consider adding rate limiting for the new route"
    ],
    "testRecommendations": [
      "Add unit tests for the authentication logic",
      "Add integration tests for the protected endpoint"
    ]
  }
}
```

#### POST /ai/review-repo
Ask the model to review a repository from the path or identifier you send. The API does not clone the repository or read its files.

**Request:**
```json
{
  "repositoryPath": "owner/repo",
  "language": "javascript",
  "analysisTypes": ["security", "code-quality"]
}
```

`analysisTypes` may include `security`, `code-quality`, `best-practices`, and `performance`. Signed-in users on the free plan are limited by `usage.reviewsLimit`.

#### POST /github/fetch-pr
Load a pull request from its GitHub URL. Auth required.

```json
{ "prUrl": "https://github.com/owner/repo/pull/42" }
```

#### POST /github/pr-comment
Post a review comment on a pull request. Auth required.

```json
{
  "prUrl": "https://github.com/owner/repo/pull/42",
  "comment": "Review summary"
}
```

---

### History

#### GET /history
Get user's analysis history.

**Query Parameters:**
- `mode` (optional): Filter by mode
- `limit` (optional): Number of results (default: 20)
- `page` (optional): Page number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "mode": "code-review",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "status": "success"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### GET /history/:id
Get specific history item with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "mode": "code-review",
    "input": {
      "code": "...",
      "language": "javascript"
    },
    "output": {...},
    "metadata": {
      "model": "gpt-4o-mini",
      "tokensUsed": 1500,
      "processingTime": 3000,
      "cacheHit": false
    },
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

#### DELETE /history/:id
Delete a history item.

**Response:**
```json
{
  "success": true,
  "message": "History item deleted"
}
```

---

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T00:00:00.000Z",
  "uptime": 12345,
  "services": {
    "mongodb": {
      "status": "connected",
      "readyState": 1
    },
    "openai": {
      "status": "configured"
    },
    "github": {
      "status": "configured"
    }
  },
  "environment": "production"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Invalid request body |
| AUTH_REQUIRED | 401 | Authentication required |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INPUT_TOO_LONG | 413 | Input exceeds maximum size |
| LIMIT_EXCEEDED | 429 | Usage limit exceeded |
| AI_SERVICE_UNAVAILABLE | 503 | OpenAI API unavailable |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limits

- **AI routes** (`/api/ai/*`): 100 requests per minute per IP by default
- Window and cap come from `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`
- `/api/health` is not rate limited

---

## Examples

### Using cURL

```bash
# Code Review
curl -X POST http://localhost:5000/api/ai/code-review \
  -H "Content-Type: application/json" \
  -d '{"code": "function add(a, b) { return a + b; }", "language": "javascript"}'

# Get Repos (replace TOKEN with the JWT from login)
curl -X GET http://localhost:5000/api/github/repos \
  -H "Authorization: Bearer TOKEN"

# Get PR Diff
curl -X GET "http://localhost:5000/api/github/repos/owner/repo/pulls/42/diff" \
  -H "Authorization: Bearer TOKEN"
```

### Using JavaScript

```javascript
const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
};

// Code Review
const response = await fetch(`${API_URL}/ai/code-review`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript'
  })
});

const data = await response.json();
console.log(data.data);
```
