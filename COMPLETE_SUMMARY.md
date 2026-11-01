# Project overview

How CodeSentry is put together. Install steps are in [SETUP.md](SETUP.md). Endpoint details are in [docs/API.md](docs/API.md).

## What the app does

A React dashboard sends code, a diff, or a repository path to an Express API. The API validates the body with Zod, optionally checks a JWT, calls OpenAI, and stores the result on the signed-in user's history in MongoDB. Redis caches responses when it is available.

Analysis modes stored on history documents:

- `code-review`
- `debug`
- `generate-tests`
- `analyze-pr`
- `repo-review`

## Request path

```text
Browser (React, Tailwind, Monaco)
        │  cookie or Authorization: Bearer
        ▼
Express
  helmet, cors, compression, cookie-parser
  authenticate (JWT, continues when no token)
  /api/auth    GitHub OAuth and current user
  /api/github  repos, pull requests, comments (login required)
  /api/ai      review, debug, tests, PR, repo review (rate limited)
  /api/history past runs (login required)
  /api/health  live, ready, dependency status
        │
        ├── MongoDB   users and history
        ├── Redis     optional cache
        └── OpenAI    gpt-4o-mini
```

## Sign-in

1. The user starts GitHub OAuth at `GET /api/auth/github`.
2. GitHub redirects to `/api/auth/github/callback` with a code.
3. The API exchanges the code, loads the GitHub profile, and upserts the user.
4. It sets an `HttpOnly` cookie, `codesentry_auth`, for 7 days.
5. Later requests send that cookie or `Authorization: Bearer <jwt>`.

`JWT_SECRET` signs the token. If it is missing, the server uses `SESSION_SECRET`.

## Pages

| Route | Who can open it |
| --- | --- |
| `/` | everyone |
| `/pricing`, `/docs`, `/security`, `/contact`, `/privacy`, `/terms` | everyone |
| `/dashboard`, `/profile` | signed-in users |
| `/auth/github/callback` | OAuth return |

## Backend map

```text
backend/src
├── index.js                 app wiring
├── config/database.js       MongoDB
├── config/redis.js          Redis, failure is non-fatal
├── controllers
│   ├── authController.js
│   ├── githubController.js
│   └── aiController.js
├── middleware
│   ├── auth.js              JWT cookie and bearer token
│   ├── validateRequest.js   Zod schemas
│   ├── rateLimiter.js       100/min on /api/ai by default
│   └── errorHandler.js
├── models/userModel.js
├── models/historyModel.js
├── routes
└── services
    ├── openaiService.js
    ├── githubService.js
    ├── cacheService.js
    └── promptBuilder.js
```

## Frontend map

```text
frontend/src
├── App.jsx                  routes and private dashboard/profile
├── context/AuthContext.jsx
├── services/api.js
└── pages
    ├── LandingPage.jsx
    ├── Dashboard.jsx
    ├── Profile.jsx
    ├── PricingPage.jsx
    ├── DocsPage.jsx
    ├── SecurityPage.jsx
    ├── ContactPage.jsx
    ├── PrivacyPage.jsx
    └── TermsPage.jsx
```

## Limits and safety already in the API

- Request bodies are size-capped in Zod (code about 50k characters, diffs about 100k).
- AI routes are rate limited per IP. Health checks are skipped.
- Helmet sets security headers. CORS allows `CLIENT_URL` with credentials.
- Free-plan repository reviews stop when `reviewsUsed` reaches `reviewsLimit`.
- Secrets stay in `.env`. `.env.example` has placeholders only.

Still your job in production: HTTPS, a real `JWT_SECRET`, MongoDB backups, and monitoring. This repository does not include Kubernetes manifests or a metrics stack.

## Docs in this repo

| File | What it covers |
| --- | --- |
| [README.md](README.md) | What it is and how to run it |
| [SETUP.md](SETUP.md) | OAuth, env vars, Docker, troubleshooting |
| [docs/API.md](docs/API.md) | Endpoints, auth, errors |
| [docs/TEST_GENERATION_GUIDE.md](docs/TEST_GENERATION_GUIDE.md) | Frameworks and scenarios |
| [docs/TEST_EXAMPLES.md](docs/TEST_EXAMPLES.md) | Sample generated tests |
