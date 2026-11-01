# Setup

Local and Docker setup for CodeSentry. The short version is in [README.md](README.md). API shapes are in [docs/API.md](docs/API.md).

## Prerequisites

- Node.js 18 or newer
- MongoDB 6 (local install or Docker)
- Redis 7 (optional; the API starts without it and skips caching)
- A GitHub OAuth App
- An OpenAI API key

## 1. GitHub OAuth app

1. Open GitHub **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy the client id and client secret into `backend/.env`.

The callback URL must match exactly, including `http` and the port.

## 2. Environment files

```bash
cd backend
cp .env.example .env
cd ../frontend
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Backend values that must be real before login and AI calls work:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | User and history storage |
| `OPENAI_API_KEY` | Model calls |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth |
| `JWT_SECRET` | Signs the session token. Falls back to `SESSION_SECRET` if unset |
| `CLIENT_URL` | CORS origin, default `http://localhost:3000` |
| `REDIS_URL` | Cache. Safe to leave as the local default if Redis is not running |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` | AI route limiter, default 100 requests per minute |

Frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Do not commit `.env`. Only `.env.example` belongs in git.

## 3. Run it

### Docker Compose

From the repository root, with the secrets available in the shell or a root `.env` that Compose can read:

```bash
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:5000/api
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

Stop with `docker compose down`. Data volumes `mongodb_data` and `redis_data` stay until you remove them.

### Two terminals

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm start
```

## 4. Check health

```bash
curl http://localhost:5000/api/health
```

`status` is `healthy` when MongoDB is connected. OpenAI and GitHub show `configured` or `not configured`. `/api/health/live` only checks that the process is up. `/api/health/ready` checks the database.

## Production notes

Set `NODE_ENV=production`, a unique `JWT_SECRET`, and `CLIENT_URL` to the real site origin. The auth cookie is `Secure` and `SameSite=None` in production, so the site must be served over HTTPS.

Put TLS on a reverse proxy. `nginx.conf` is the included proxy config. This repo does not ship Kubernetes manifests.

`docker compose up --scale` is a poor fit here because the Compose file sets fixed `container_name` values. Run one backend container, or drop those names before scaling.

## Troubleshooting

**MongoDB connection failed.** Confirm MongoDB is listening on the URI in `.env`. With Compose: `docker compose ps` and `docker compose logs mongodb`.

**GitHub login fails.** Recheck the callback URL, client id, and client secret. The API and the React app must agree on `CLIENT_URL` and `REACT_APP_API_URL`.

**OpenAI errors.** Confirm the key and that the account can call `gpt-4o-mini`. Backend logs use Winston.

**Port already in use.** Stop the other process on 3000 or 5000. On Windows: `netstat -ano | findstr :5000`, then end that PID. On macOS or Linux: `lsof -i :5000`.

## Tests

```bash
cd backend
npm test
```

The backend test script runs Jest. Add tests next to the code you change. The frontend test script is Create React App's `react-scripts test`.
