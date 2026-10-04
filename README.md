# FIFA World Cup 2026 Predictor

A **MERN Stack** web app that lets you build group stages, run tournament simulations, and get **AI/ML win predictions** for real football fans.

- **M**ongoDB — stores teams, match setups, predictions, and tournament history
- **E**xpress — REST API backend
- **R**eact — frontend UI (Vite)
- **N**ode.js — server runtime

## Features

| Page | What it does |
|------|-------------|
| **Home** | Overview, recent simulations, quick links |
| **Teams** | Add/edit/delete teams (CRUD), import/export JSON |
| **Builder** | Pick 48 teams, configure 12 groups (A–L), and set up knockout brackets |
| **AI Predict** | ML win probability (weighted ELO scoring + Monte Carlo simulation) |
| **Simulate** | Watch the World Cup play out match-by-match from groups to the Final |
| **Results** | View champion, tournament stats, timeline, share results |

## Tournament datasets

The homepage reads the group draw, group-stage fixtures, and knockout schedule from
`datasets/groups.csv`, `datasets/matches.csv`, and `datasets/knockout.csv`. The client
copies these source files into its public data folder automatically before starting,
building, or testing, so the website always uses the repository's CSV datasets.

Build the Docker image from the repository root so the source datasets are available:

```bash
docker build -f client/Dockerfile -t fifa-world-cup-2026 .
```

## AI / ML (Simple & Easy to Understand)

The ML lives in `server/ml/predictor.js`:

1. **Weighted Scoring** — combines ELO rating, recent form, offensive/defensive strength, and group draw dynamics
2. **Monte Carlo** — runs 500 quick tournament simulations and counts who wins the trophy most often

No TensorFlow or Python needed — pure JavaScript that's easy to read and modify.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- MongoDB is **optional** — file storage works out of the box

## Quick Start

### 1. Install dependencies

```bash
npm run install-all
```

### 2. Configure database (optional)

Copy the example env file:

```bash
copy server\.env.example server\.env
```

The server tries MongoDB first. If it is not running, it automatically uses JSON file storage — no extra setup needed.

### 3. Start the backend (Terminal 1)

```bash
npm run server
```

Server runs at **http://localhost:5000**

### 4. Start the frontend (Terminal 2)

```bash
npm run client
```

App opens at **http://localhost:3000**

## Project Structure

```
FIFA-World-Cup-2026-Predictor/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Home, Teams, Builder, Simulate, Results, Predictions
│       ├── components/     # Navbar, shared UI
│       └── App.css         # All page styles
├── server/                 # Express backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── ml/predictor.js     # AI/ML prediction logic
│   └── data/               # Default team roster & tournament schedule
└── package.json            # Root scripts
```

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/teams` | List all teams |
| POST | `/api/teams` | Add team |
| PUT | `/api/teams/:id` | Update team |
| DELETE | `/api/teams/:id` | Delete team |
| POST | `/api/teams/reset` | Reset to default team roster |
| GET | `/api/setup` | Get current tournament setup |
| POST | `/api/setup` | Save tournament setup |
| GET | `/api/simulations` | Simulation history |
| POST | `/api/simulations` | Save simulation result |
| POST | `/api/predict` | Quick AI prediction |
| POST | `/api/predict/monte-carlo` | Monte Carlo prediction |

## License

See [LICENSE](LICENSE).

---
*Fan project — not affiliated with FIFA*
