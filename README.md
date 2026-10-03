# FIFA World Cup 2026 Predictor

MERN app: users register, predict match scores, and compete on a leaderboard. Admins enter real results; points are awarded automatically (exact score = 3, correct outcome = 1).

- `client/` – React (Create React App) UI
- `server/` – Express + MongoDB API (`server/src/app.js` is the app, `server/src/server.js` runs it locally)
- `api/index.js` – Vercel serverless entry that wraps the same Express app

## Run locally
```bash
npm run install:all && npm install --prefix server
cp server/.env.example server/.env      # fill in MONGODB_URI and both JWT secrets
npm run seed                            # loads 48 teams + schedule
npm run dev                             # API :5000, client :3000
```

## Deploy on Vercel
1. Create a MongoDB Atlas cluster. Under **Network Access** allow `0.0.0.0/0` (Vercel IPs are dynamic).
2. In Vercel → Project → Settings → Environment Variables add:
   `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`.
3. Leave Root Directory empty and Framework Preset on **Other** (settings come from `vercel.json`).
4. Seed the database once from your computer: put the Atlas URI in `server/.env`, run `npm run seed`.
5. Redeploy, then open `/api/health` – it should return `{"status":"ok"}`.

*Fan project – not affiliated with FIFA.*
