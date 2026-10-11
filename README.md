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

## 🌐 Deployment Guide: Vercel (Frontend) + Azure (Backend)

---

### Step 1: Deploy Backend to Microsoft Azure

You can host the backend on **Azure App Service** or **Azure Container Apps**:

#### Method A: Azure App Service (Recommended for standard Node.js deployment)
1. Go to the [Azure Portal](https://portal.azure.com/) and create a **Web App** (Linux, Node 20 LTS).
2. Set the deployment source to **GitHub** and connect this repository:
   - If using GitHub Actions, configure the deployment working directory to `backend`.
3. ⚠️ **CRITICAL AZURE WEBSOCKET SETTING**:
   - In Azure Portal, navigate to your App Service:
   - Go to **Configuration** (or **Configuration** → **General settings**).
   - Find **Web sockets** and switch it to **ON**.
   - Click **Save**.
4. In **Application settings** (Environment variables):
   - Add `PORT` = `8080` (or leave default, the app automatically reads `process.env.PORT`).
   - Add `CORS_ORIGIN` = `*` (or your Vercel frontend domain).
5. In **Configuration** → **General settings** → **Startup Command**:
   - Set: `npm start`
6. Note your Azure URL: `https://<your-app-name>.azurewebsites.net`.
   - Your WebSocket URL is: `wss://<your-app-name>.azurewebsites.net/ws`.
   - Test health check: `https://<your-app-name>.azurewebsites.net/health`.

#### Method B: Azure Container Apps (Docker-based)
1. The `backend/Dockerfile` is pre-configured.
2. In Azure Portal, search for **Container Apps** → **Create**.
3. Point to this repository's `backend` folder or build the container image.
4. Set Target Port: `3001` (or `8080`).
5. Enable Ingress: **Accept traffic from anywhere** (External).
6. Note your Container App URL: `https://<your-app>.<region>.azurecontainerapps.io`.

---

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com/) and click **Add New** → **Project**.
2. Import this GitHub repository.
3. In the **Configure Project** screen:
   - **Root Directory**: Click "Edit" and choose:
     ```
     frontend
     ```
   - **Framework Preset**: Vite (detected automatically).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add your Azure backend URLs:
   - `VITE_BACKEND_URL`: `https://<your-azure-app>.azurewebsites.net`
   - `VITE_WS_URL`: `wss://<your-azure-app>.azurewebsites.net/ws`
5. Click **Deploy**.

Vercel will build and host the frontend, automatically connecting to your live Azure backend.
