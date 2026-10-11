import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n==================================================');
console.log('🚀 Launching Family Feud Segregated Dev Environment');
console.log('📦 Backend  -> http://localhost:3001 (WebSocket on /ws)');
console.log('🎨 Frontend -> http://localhost:5173 (Vite + Proxy to :3001)');
console.log('==================================================\n');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

// 1. Start Backend Server on Port 3001
const backend = spawn(npxCmd, ['tsx', 'watch', 'backend/src/server.ts'], {
  cwd: __dirname,
  env: { ...process.env, PORT: '3001', CORS_ORIGIN: '*' },
  shell: true,
  stdio: 'pipe',
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[BACKEND]\x1b[0m ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[BACKEND ERR]\x1b[0m ${data}`);
});

// 2. Start Frontend Vite Server on Port 3000
const frontend = spawn(npxCmd, ['vite', 'frontend'], {
  cwd: __dirname,
  env: {
    ...process.env,
    VITE_BACKEND_URL: 'http://localhost:3001',
    VITE_WS_URL: 'ws://localhost:3001/ws',
  },
  shell: true,
  stdio: 'pipe',
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[33m[FRONTEND]\x1b[0m ${data}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[FRONTEND ERR]\x1b[0m ${data}`);
});

// Graceful cleanup on process exit
function cleanup() {
  console.log('\n🛑 Shutting down dev servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
