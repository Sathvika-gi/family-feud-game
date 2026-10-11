import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GameState, GameAction, RoundType } from './types/game';
import { DEFAULT_QUESTIONS, DEFAULT_FAST_MONEY } from './data/defaultSurveys';

const app = express();
app.use(express.json());

// Enable CORS for Vercel and local frontend origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// In-Memory Game Store
const games = new Map<string, GameState>();

// WebSocket connection room mapping: ws -> { gameId: string, role: string }
const clients = new Map<WebSocket, { gameId: string; role: string }>();

function createInitialGameState(gameId: string): GameState {
  return {
    id: gameId,
    name: 'FAMILY FEUD STUDIO OPERATIONS',
    status: 'playing',
    currentRound: 'r1',
    roundMultiplier: 1,
    currentQuestionIndex: 0,
    currentTeamId: null,
    teams: [
      {
        id: 'team-1',
        name: 'THE JOHNSONS',
        score: 0,
        captain: 'Marcus',
        members: '',
        strikes: 0,
        color: '#FFB800',
      },
      {
        id: 'team-2',
        name: 'THE MILLERS',
        score: 0,
        captain: 'Sarah',
        members: '',
        strikes: 0,
        color: '#FFB800',
      },
    ],
    questions: JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)),
    fastMoney: JSON.parse(JSON.stringify(DEFAULT_FAST_MONEY)),
    updatedAt: Date.now(),
  };
}

// Pre-populate default room
games.set('FF-90210', createInitialGameState('FF-90210'));

function getOrCreateGame(gameId: string): GameState {
  const normalizedId = (gameId || 'FF-90210').toUpperCase().trim();
  if (!games.has(normalizedId)) {
    games.set(normalizedId, createInitialGameState(normalizedId));
  }
  return games.get(normalizedId)!;
}

function calculateCurrentRoundPot(game: GameState): number {
  const currentQ = game.questions[game.currentQuestionIndex];
  if (!currentQ) return 0;
  const revealedSum = currentQ.answers
    .filter((a) => a.revealed)
    .reduce((sum, a) => sum + a.points, 0);
  return revealedSum * game.roundMultiplier;
}

function applyGameAction(game: GameState, action: GameAction): GameState {
  const currentQ = game.questions[game.currentQuestionIndex];

  switch (action.type) {
    case 'SET_ACTIVE_TEAM': {
      game.currentTeamId = action.teamId;
      break;
    }
    case 'SET_ROUND': {
      game.currentRound = action.round;
      if (action.round === 'r1') game.roundMultiplier = 1;
      else if (action.round === 'r2') game.roundMultiplier = 2;
      else if (action.round === 'r3') game.roundMultiplier = 3;
      break;
    }
    case 'REVEAL_ANSWER': {
      if (currentQ) {
        const ans = currentQ.answers.find((a) => a.id === action.answerId);
        if (ans) {
          ans.revealed = true;
          game.lastSfx = { id: Math.random().toString(), sound: 'ding', timestamp: Date.now() };
        }
      }
      break;
    }
    case 'HIDE_ANSWER': {
      if (currentQ) {
        const ans = currentQ.answers.find((a) => a.id === action.answerId);
        if (ans) {
          ans.revealed = false;
        }
      }
      break;
    }
    case 'REVEAL_ALL_ANSWERS': {
      if (currentQ) {
        currentQ.answers.forEach((a) => (a.revealed = true));
        game.lastSfx = { id: Math.random().toString(), sound: 'ding', timestamp: Date.now() };
      }
      break;
    }
    case 'HIDE_ALL_ANSWERS': {
      if (currentQ) {
        currentQ.answers.forEach((a) => (a.revealed = false));
      }
      break;
    }
    case 'AWARD_POT_TO_TEAM': {
      const pot = calculateCurrentRoundPot(game);
      const team = game.teams.find((t) => t.id === action.teamId);
      if (team) {
        team.score += pot;
        game.lastSfx = { id: Math.random().toString(), sound: 'fanfare', timestamp: Date.now() };
      }
      break;
    }
    case 'TRIGGER_FINAL_CALL': {
      game.winnerTeamId = action.teamId;
      game.lastSfx = { id: Math.random().toString(), sound: 'fanfare', timestamp: Date.now() };
      break;
    }
    case 'CLEAR_FINAL_CALL': {
      game.winnerTeamId = null;
      break;
    }
    case 'AWARD_ANSWER_TO_TEAM': {
      if (currentQ) {
        const ans = currentQ.answers.find((a) => a.id === action.answerId);
        const team = game.teams.find((t) => t.id === action.teamId);
        if (ans && team) {
          ans.revealed = true;
          team.score += ans.points;
          game.lastSfx = { id: Math.random().toString(), sound: 'ding', timestamp: Date.now() };
        }
      }
      break;
    }
    case 'ADJUST_TEAM_SCORE': {
      const team = game.teams.find((t) => t.id === action.teamId);
      if (team) {
        team.score = Math.max(0, team.score + action.delta);
      }
      break;
    }
    case 'SET_TEAM_SCORE': {
      const team = game.teams.find((t) => t.id === action.teamId);
      if (team) {
        team.score = Math.max(0, action.score);
      }
      break;
    }
    case 'UPDATE_TEAM_INFO': {
      const team = game.teams.find((t) => t.id === action.teamId);
      if (team) {
        if (action.name !== undefined) team.name = action.name;
        if (action.captain !== undefined) team.captain = action.captain;
        if (action.members !== undefined) team.members = action.members;
      }
      break;
    }
    case 'ADD_STRIKE': {
      const team = game.teams.find((t) => t.id === action.teamId);
      if (team) {
        team.strikes = team.strikes >= 1 ? 0 : team.strikes + 1;
        game.lastSfx = {
          id: Math.random().toString(),
          sound: 'buzz',
          timestamp: Date.now(),
        };
      }
      break;
    }
    case 'CLEAR_STRIKES': {
      const team = game.teams.find((t) => t.id === action.teamId);
      if (team) {
        team.strikes = 0;
      }
      break;
    }
    case 'NEXT_ROUND': {
      if (game.currentRound === 'r1') {
        game.currentRound = 'r2';
        game.roundMultiplier = 2;
      } else if (game.currentRound === 'r2') {
        game.currentRound = 'r3';
        game.roundMultiplier = 3;
      } else if (game.currentRound === 'r3') {
        game.currentRound = 'fast_money';
        game.roundMultiplier = 1;
      }
      game.currentQuestionIndex = (game.currentQuestionIndex + 1) % game.questions.length;
      game.currentTeamId = null;
      game.teams[0].strikes = 0;
      game.teams[1].strikes = 0;
      break;
    }
    case 'RESET_ROUND': {
      if (currentQ) {
        currentQ.answers.forEach((a) => (a.revealed = false));
      }
      game.teams[0].strikes = 0;
      game.teams[1].strikes = 0;
      break;
    }
    case 'NEW_GAME': {
      const defaultState = createInitialGameState(game.id);
      Object.assign(game, defaultState);
      break;
    }
    case 'LOAD_QUESTION': {
      const existingIdx = game.questions.findIndex((q) => q.text.toLowerCase() === action.question.text.toLowerCase());
      if (existingIdx !== -1) {
        game.questions[existingIdx] = action.question;
        game.currentQuestionIndex = existingIdx;
      } else {
        game.questions.unshift(action.question);
        game.currentQuestionIndex = 0;
      }
      game.teams[0].strikes = 0;
      game.teams[1].strikes = 0;
      break;
    }
    case 'UPDATE_QUESTION_TEXT': {
      if (currentQ) {
        currentQ.text = action.text;
      }
      break;
    }
    case 'UPDATE_ANSWER': {
      if (currentQ) {
        const ans = currentQ.answers.find((a) => a.id === action.answerId);
        if (ans) {
          if (action.text !== undefined) ans.text = action.text;
          if (action.points !== undefined) ans.points = action.points;
        }
      }
      break;
    }
    case 'PLAY_SFX': {
      game.lastSfx = { id: Math.random().toString(), sound: action.sound, timestamp: Date.now() };
      break;
    }
    case 'UPDATE_FAST_MONEY': {
      Object.assign(game.fastMoney, action.payload);
      break;
    }
    case 'UPDATE_FAST_MONEY_ANSWER': {
      const q = game.fastMoney.questions.find((item) => item.id === action.questionId);
      if (q) {
        if (action.player === 1) {
          q.player1Answer = action.answer;
          q.player1Points = action.points;
        } else {
          q.player2Answer = action.answer;
          q.player2Points = action.points;
        }
      }
      break;
    }
  }

  game.updatedAt = Date.now();
  return game;
}

function broadcastToGame(gameId: string, message: any, excludeWs?: WebSocket) {
  const json = JSON.stringify(message);
  for (const [client, meta] of clients.entries()) {
    if (meta.gameId === gameId && client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
}

// WebSocket Connection Management
wss.on('connection', (ws: WebSocket) => {
  clients.set(ws, { gameId: 'FF-90210', role: 'guest' });

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'join') {
        const gameId = (msg.gameId || 'FF-90210').toUpperCase().trim();
        clients.set(ws, { gameId, role: msg.role || 'client' });
        const game = getOrCreateGame(gameId);
        ws.send(JSON.stringify({ type: 'sync', state: game }));
      } else if (msg.type === 'action') {
        const meta = clients.get(ws);
        const gameId = meta?.gameId || 'FF-90210';
        const game = getOrCreateGame(gameId);
        const updated = applyGameAction(game, msg.action);
        broadcastToGame(gameId, { type: 'sync', state: updated, action: msg.action });
      } else if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// REST API Endpoints
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    activeGames: games.size,
    connectedSockets: clients.size,
  });
});

app.get('/api/games/:gameId', (req, res) => {
  const game = getOrCreateGame(req.params.gameId);
  res.json({ state: game });
});

app.post('/api/games/:gameId/action', (req, res) => {
  const gameId = req.params.gameId.toUpperCase().trim();
  const game = getOrCreateGame(gameId);
  const action = req.body as GameAction;
  const updated = applyGameAction(game, action);
  broadcastToGame(gameId, { type: 'sync', state: updated, action });
  res.json({ state: updated });
});

app.post('/api/games', (req, res) => {
  const gameId = req.body?.gameId || `FF-${Math.floor(10000 + Math.random() * 90000)}`;
  const normalized = gameId.toUpperCase().trim();
  const game = createInitialGameState(normalized);
  games.set(normalized, game);
  res.json({ gameId: normalized, state: game });
});

// Port configuration for Railway / local hosting
const PORT = Number(process.env.PORT || 3001);

server.listen(PORT, () => {
  console.log(`> Family Feud Backend Server running on port ${PORT}`);
  console.log(`> Healthcheck: http://localhost:${PORT}/health`);
  console.log(`> WebSocket: ws://localhost:${PORT}/ws`);
});
