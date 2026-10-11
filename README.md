# Family Feud Game Show (Segregated Architecture)

This project has been segregated into independent **Frontend** and **Backend** applications, configured for easy one-click hosting on **Vercel** and **Railway**.

---

## Project Structure

```
family-feud-game/
├── frontend/                     # Standalone React + Vite Frontend (Vercel)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts           # Proxy to backend on :3001 in local dev
│   ├── vercel.json              # Client-side SPA routing rewrites
│   ├── .env.example             # Vercel environment variables guide
│   ├── public/                  # Static assets & logos
│   └── src/                     # React components, sound effects, state
│
├── backend/                      # Standalone Node.js + WebSocket Backend (Railway)
│   ├── package.json
│   ├── tsconfig.json
│   ├── Procfile                 # Cloud web process entrypoint
│   ├── railway.json             # Railway Nixpacks deployment config
│   ├── .env.example
│   └── src/
│       ├── server.ts            # Express + WebSocket server with CORS & healthcheck
│       ├── types/game.ts        # Shared game types
│       └── data/defaultSurveys.ts # Survey bank questions & answers
│
├── run-dev.js                   # Local orchestrator for simultaneous dev
└── package.json                 # Monorepo command runner
```

---

## 🚀 Local Development

You can run both services together or separately:

### Option 1: Run Both Simultaneously (Recommended)
From the project root:
```bash
npm run dev
```
- **Frontend** runs at: `http://localhost:3000`
- **Backend** runs at: `http://localhost:3001` (WebSocket: `ws://localhost:3001/ws`)
- All requests (`/api` and `/ws`) are automatically proxied from `:3000` to `:3001`.

### Option 2: Run Separately
**Backend:**
```bash
cd backend
npm run dev
```
**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🌐 Deployment Guide

### 1. Deploy Backend to Railway

1. Go to [railway.app](https://railway.app/) and create a new project.
2. Select **Deploy from GitHub repo** and choose this repository.
3. In the Railway dashboard:
   - Go to **Settings** -> **Root Directory** -> Set to `backend`.
4. Railway will automatically detect `backend/package.json` and `backend/Procfile`.
5. Go to **Settings** -> **Networking** -> **Generate Domain** to get your public backend URL (e.g. `https://family-feud-backend-production.up.railway.app`).
6. (Optional) In **Variables**, add:
   - `CORS_ORIGIN=*` (or your Vercel frontend domain)

---

### 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com/) and click **Add New** -> **Project**.
2. Import this GitHub repository.
3. In the **Configure Project** screen:
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Framework Preset**: Vite (detected automatically).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_BACKEND_URL`: Your Railway backend domain (e.g. `https://your-backend.up.railway.app`)
   - `VITE_WS_URL`: Your Railway WebSocket URL (e.g. `wss://your-backend.up.railway.app/ws`)
5. Click **Deploy**.

Vercel will build and host the frontend, automatically connecting to your live Railway backend.
