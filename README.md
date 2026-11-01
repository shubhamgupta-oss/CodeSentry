# CodeSentry

AI-assisted code quality workspace. Paste code, open a pull request, or describe a repository, then run a review, a debug pass, test generation, or a pull-request risk check. The web app talks to an Express API, stores users in MongoDB, and calls OpenAI (`gpt-4o-mini`).

## Features

- **Code review** for bugs, security issues, and complexity
- **Debug assistant** that takes code plus an error message and returns a likely cause and a fix
- **Test generation** for Jest, Mocha, Jasmine, Pytest, unittest, Cypress, Playwright, Go, and Selenium-style suites
- **Pull request analysis** from a diff or a GitHub pull request URL
- **Repository review** that sends a repository path to the model as context (the server does not clone the repo)
- **GitHub sign-in** with OAuth, a JWT cookie, repository list, and pull request comments
- **History** of past analyses for the signed-in user

The interface includes a landing page, pricing, docs, security, contact, privacy, terms, a dashboard, and a profile page.

## Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, React Router, Tailwind CSS, Monaco Editor |
| Backend | Node.js 18, Express 4, Zod, Winston |
| Data | MongoDB, Redis (optional cache) |
| Auth | GitHub OAuth, JWT (`HttpOnly` cookie or `Authorization: Bearer`) |
| Model | OpenAI `gpt-4o-mini` |

## Quick start

You need Node.js 18+, MongoDB, a [GitHub OAuth app](https://github.com/settings/developers), and an OpenAI API key. Redis is optional. If it is down, the API keeps running without cache.

```bash
git clone https://github.com/shubhamgupta-oss/CodeSentry.git
cd CodeSentry
```

**Backend**

```bash
cd backend
npm install
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env`.

Fill in `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codesentry
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-api-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
SESSION_SECRET=replace-with-a-long-random-string
JWT_SECRET=replace-with-a-different-long-random-string
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

GitHub OAuth callback URL:

`http://localhost:5000/api/auth/github/callback`

**Frontend** (second terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

`frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the API with `npm run dev` inside `backend`. The app is at [http://localhost:3000](http://localhost:3000). Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health).

### Docker

From the repo root, export the same secrets (`OPENAI_API_KEY`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `SESSION_SECRET`) and run:

```bash
docker compose up --build
```

Frontend: [http://localhost:3000](http://localhost:3000). API: [http://localhost:5000/api](http://localhost:5000/api).

## Project layout

```text
CodeSentry/
├── backend/src
│   ├── config/          database and Redis
│   ├── controllers/     auth, GitHub, AI
│   ├── middleware/      auth, validation, rate limit, errors
│   ├── models/          user and history
│   ├── routes/          /api/auth, /github, /ai, /history, /health
│   └── services/        OpenAI, GitHub, cache, prompts
├── frontend/src
│   ├── pages/           landing, dashboard, profile, pricing, docs, legal
│   ├── context/         auth state
│   └── services/        API client
├── docs/                API reference and test-generation notes
├── docker-compose.yml
└── nginx.conf
```

## API

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/auth/github` | public |
| `GET` `/POST` | `/api/auth/github/callback` | public |
| `GET` | `/api/auth/me` | required |
| `GET` | `/api/github/repos` | required |
| `POST` | `/api/ai/code-review` | optional |
| `POST` | `/api/ai/debug` | optional |
| `POST` | `/api/ai/generate-tests` | optional |
| `POST` | `/api/ai/analyze-pr` | optional |
| `POST` | `/api/ai/review-repo` | optional |
| `GET` | `/api/history` | required |
| `GET` | `/api/health` | public |

Request and response shapes are in [docs/API.md](docs/API.md). Setup, Docker, and troubleshooting are in [SETUP.md](SETUP.md). Architecture notes are in [COMPLETE_SUMMARY.md](COMPLETE_SUMMARY.md).

## License

MIT. See [LICENSE](LICENSE).
