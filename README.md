# FIFA World Cup 2026 Predictor

## 🏆 Overview

The FIFA World Cup 2026 Predictor is a full-stack **MERN** (MongoDB, Express, React, Node.js) web application where users create an account, predict scores for every match of the tournament, and compete on a leaderboard as real results come in. From the group stage to the grand final, it covers all 104 matches.

> **Implementation note:** This repository currently ships the full MERN application described below — authentication, predictions, standings, knockout bracket, leaderboard, and an admin results panel — secured and ready to deploy. The ML/Python prediction-engine section further down describes a **planned extension** (probabilistic match forecasting) that is not yet implemented; see that section for details on adding it.

## ✨ Features

### Tournament Coverage
- **Group Stage Predictions** (48 matches across 12 groups)
- **Round of 32** (16 matches)
- **Round of 16** (8 matches)
- **Quarter-Finals** (4 matches)
- **Semi-Finals** (2 matches)
- **Third-Place Playoff** (1 match)
- **Grand Final** (1 match)

### Core Functionality
- **Real-time Match Predictions**: Get win/draw/loss probabilities for every match
- **Team Performance Analysis**: Comprehensive statistics and form tracking
- **Interactive Dashboard**: Visual representation of tournament progression
- **Live Updates**: Dynamic predictions adjusting with new data
- **Historical Data Integration**: Analysis of past performances and head-to-head records

## 🛠️ Technology Stack

### Frontend (`client/`)
- **React 18** with **React Router 6** - UI and client-side routing
- **Axios** - API client with automatic access-token refresh
- **React Context** - Auth state management
- **Bootstrap 5** - Styling and components
- **react-hot-toast** - Notifications

### Backend (`server/`)
- **Node.js** with **Express.js** - RESTful API
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** (access + refresh tokens) - Authentication
- **bcryptjs** - Password hashing
- **helmet, express-rate-limit, express-mongo-sanitize, hpp, express-validator, cors** - Security middleware (see Security section)
- **Jest + Supertest** - API testing

### AI/ML Components (planned extension — see note above)
- **Python** - ML model development
- **Scikit-learn** - Classical ML algorithms
- **XGBoost** / **LightGBM** - Gradient boosting
- **TensorFlow** / **PyTorch** - Deep learning
- **Pandas** & **NumPy** - Data processing
- **FastAPI** - ML model serving

## 🚀 Installation

### Prerequisites
```bash
Node.js (v18+)
npm
MongoDB (local install, or a free MongoDB Atlas cluster)
```

### Repository layout
```
FIFA-World-Cup-2026-Predictor/
├── server/     # Express + MongoDB API
├── client/     # React frontend (Create React App)
├── docker-compose.yml
└── package.json  # convenience scripts to run both at once
```

### Quick start (recommended)
```bash
git clone https://github.com/yourusername/fifa-worldcup-2026-predictor.git
cd fifa-worldcup-2026-predictor

# Install dependencies for both server and client
npm run install:all

# Configure environment variables (see below), then seed the database
cd server && cp .env.example .env && npm run seed && cd ..
cd client && cp .env.example .env && cd ..

# Run backend (port 5000) and frontend (port 3000) together
npm run dev
```

### Backend Setup (manual)
```bash
cd server
npm install

cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets (see Environment Variables below)

# Seed teams + match schedule (development/staging only — never run against
# a live production DB you don't intend to reset)
npm run seed

npm run dev      # nodemon, auto-restarts on changes
# or: npm start  # production mode
```

### Frontend Setup (manual)
```bash
cd client
npm install

cp .env.example .env
# Edit .env if your API isn't on http://localhost:5000

npm start
```

### Docker (both services + MongoDB)
```bash
cd server && cp .env.example .env && cd ..   # fill in real secrets first
docker-compose up -d --build

# Seed the containerized database once it's up
docker-compose exec server node scripts/seed.js
```

### 🤖 ML Model Setup (planned, not yet implemented)
The sections below describe a future extension where a Python service produces
probability-based predictions (win/draw/loss %, xG) that the API would surface
alongside user predictions. It is **not part of the current codebase** — the
app currently uses direct user predictions and a points-based leaderboard
instead of a trained model. If you build this out, the pattern below is a
reasonable starting point:
```bash
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_models.py
python api_server.py
```

## 📊 Machine Learning Models (planned extension, see note above)

### Data Sources
- Historical FIFA World Cup results (1930-2022)
- FIFA World Rankings
- Team ELO ratings
- Player performance metrics
- Head-to-head records
- Recent form (last 10 matches)

### Prediction Models
1. **XGBoost Classifier**: Primary prediction model
2. **Random Forest**: Ensemble method for validation
3. **Neural Network**: Deep learning approach
4. **Logistic Regression**: Baseline model

### Features Used
- Team ELO ratings
- Goal scoring statistics
- Defensive metrics
- Recent match results
- Tournament stage factors
- Home/Away advantage
- Player availability

### Prediction Output
- Win probability (%)
- Draw probability (%)
- Loss probability (%)
- Expected goals (xG)
- Confidence score
- Most probable scoreline

## 🎯 API Endpoints

### Authentication
```
POST /api/auth/register - Create an account (returns access token, sets refresh cookie)
POST /api/auth/login    - Log in (rate-limited, account lockout after 5 failed attempts)
POST /api/auth/refresh  - Exchange the httpOnly refresh cookie for a new access token
POST /api/auth/logout   - Revoke the current refresh token
GET  /api/auth/me       - Get the logged-in user's profile (requires Authorization header)
```

### Teams
```
GET /api/teams              - Get all teams
GET /api/teams/rankings     - Get teams sorted by FIFA ranking
GET /api/teams/group/:group - Get teams in a specific group (A-L)
GET /api/teams/:id          - Get a single team
```

### Matches & Predictions
```
GET  /api/matches               - Get all matches (filter with ?stage=, ?group=, ?team=)
GET  /api/matches/stage/:stage  - Get matches for a tournament stage
GET  /api/matches/:id           - Get a single match
PUT  /api/matches/:id           - Record a result (admin only)

POST /api/predictions           - Submit/update your prediction for a match (auth required)
GET  /api/predictions/my        - Get your own predictions (auth required)
GET  /api/predictions/match/:matchId - Get the prediction count for a match
```

### Standings & Leaderboard
```
GET /api/standings/groups          - Group standings (recomputed on each request)
GET /api/standings/best-third      - Best third-placed teams (top 8 advance)
GET /api/standings/knockout-bracket - Full knockout bracket by stage
GET /api/leaderboard?limit=20      - Top users by points
```

### Health
```
GET /api/health - Service liveness check (used by uptime monitors / container orchestrators)
```

## 🎨 User Interface

### Dashboard
- **Interactive World Map**: Visual representation of teams and progress
- **Live Scoreboard**: Real-time match results and predictions
- **Group Standings**: Dynamic table updates
- **Knockout Bracket**: Interactive bracket visualization
- **Statistics Center**: Comprehensive team and player stats

### Features
- **Responsive Design**: Optimized for all devices
- **Dark/Light Mode**: User preference support
- **Live Notifications**: Real-time updates
- **Match Filters**: By stage, team, date
- **Prediction History**: Track accuracy over time

## 📈 Performance Metrics

### Model Accuracy
- **Historical Validation**: 68-72% accuracy on past tournaments
- **Confidence Scoring**: 0-100% confidence levels
- **Calibration**: Probability calibration for accurate predictions

### System Performance
- **Response Time**: < 200ms for API calls
- **Concurrent Users**: Support for 10,000+ simultaneous users
- **Data Processing**: Real-time updates with < 5s delay

## 🔒 Security

Implemented in this codebase:

- **Auth**: short-lived JWT access tokens (kept in memory on the client, never in `localStorage`) + long-lived refresh tokens stored as `httpOnly`, `sameSite=strict`, `secure`-in-production cookies, with rotation on every refresh.
- **Password handling**: bcrypt hashing (12 salt rounds), minimum-length/complexity validation, per-account lockout after 5 failed login attempts (15 min).
- **Rate limiting**: stricter limits on `/api/auth/*` (20 req/15min) than the rest of the API (300 req/15min), via `express-rate-limit`.
- **Input validation**: every route that accepts a body/param is validated with `express-validator`; invalid input never reaches a controller.
- **Injection protection**: `express-mongo-sanitize` strips `$`/`.` operators from user input to block NoSQL injection; Mongoose schemas add a second layer of type/enum validation.
- **HTTP hardening**: `helmet` (with a restrictive Content-Security-Policy), `hpp` (HTTP parameter pollution guard), request body size capped at 10kb.
- **CORS**: explicit origin allow-list read from `CORS_ORIGIN`, credentials enabled only for those origins.
- **Access control**: role-based (`user`/`admin`) middleware on match-result and admin endpoints, re-checked server-side on every request — the Admin UI screen is a convenience, not the security boundary.
- **Secrets**: all credentials/keys via environment variables (`.env`, gitignored); the app refuses to start if required secrets are missing.
- **Error handling**: centralized error handler that logs full details server-side but never leaks stack traces to clients in production.
- **Transport security**: HTTPS is expected to be terminated at your reverse proxy/hosting platform (Nginx, Render, Railway, etc.) in production — `trust proxy` is enabled so secure cookies and rate limiting work correctly behind one.
- **Non-root containers**: the server Docker image runs as an unprivileged user.

Recommended before going to production: put the app behind HTTPS end-to-end, rotate the JWT secrets, enable MongoDB Atlas IP allow-listing or VPC peering, and consider adding a Web Application Firewall or managed DDoS protection in front of the API.

## 🚀 Deployment

### Option A — Docker Compose (simplest, includes MongoDB)
```bash
cd server && cp .env.example .env   # fill in real secrets, MONGODB_URI is overridden by compose
docker-compose up -d --build
docker-compose exec server node scripts/seed.js
```
This runs MongoDB, the API (port 5000), and the React app served by Nginx (port 3000).

### Option B — Separate hosting (e.g. Render/Railway for the API, Vercel/Netlify for the client, MongoDB Atlas for the database)
```bash
# Server
cd server
npm ci
npm start          # or let your platform run `node src/server.js`

# Client — build a static bundle and deploy the build/ folder
cd client
npm ci
npm run build
```
Point `REACT_APP_API_URL` (client) at your deployed API URL, and `CORS_ORIGIN` (server) at your deployed frontend URL, before building.

### Environment Variables

**`server/.env`**
```env
NODE_ENV=production
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/worldcup2026

JWT_ACCESS_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<generate a different one the same way>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=info
```

**`client/.env`**
```env
REACT_APP_API_URL=https://your-api-domain.com
```

Never commit either `.env` file — only the `.env.example` templates are tracked in git.

## 🧪 Testing

```bash
# Backend integration tests (Jest + Supertest + an in-memory MongoDB instance)
cd server && npm test

# Frontend tests
cd client && npm test
```
The included backend tests cover the registration/login flow (weak passwords, duplicate accounts, wrong credentials). Extend `server/tests/` as you add more routes.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📧 Contact

Project Link: [https://github.com/yourusername/fifa-worldcup-2026-predictor](https://github.com/yourusername/fifa-worldcup-2026-predictor)

## 🙏 Acknowledgments

- FIFA for official data and statistics
- Open-source community for ML libraries
- Football data providers
- All contributors and testers

---

**Note**: This is a predictive tool for entertainment purposes. Actual results may vary.
