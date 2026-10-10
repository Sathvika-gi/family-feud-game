import express from 'express';
import Redis from 'ioredis';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameState, GameAction, RoundType } from '../src/types/game';
import { DEFAULT_QUESTIONS, DEFAULT_FAST_MONEY } from '../src/data/defaultSurveys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const redisUrl = process.env.KV_URL || process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl);


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
        color: '#00e3fd',
      },
      {
        id: 'team-2',
        name: 'THE MILLERS',
        score: 0,
        captain: 'Sarah',
        members: '',
        strikes: 0,
        color: '#ffb0b3',
      },
    ],
    questions: JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)),
    fastMoney: JSON.parse(JSON.stringify(DEFAULT_FAST_MONEY)),
    updatedAt: Date.now(),
  };
}

// Pre-populate default room pattern removed for dynamic setup

async function getOrCreateGame(gameId: string): Promise<GameState> {
  const normalizedId = (gameId || 'FF-90210').toUpperCase().trim();
  const data = await redis.get(`game:${normalizedId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch(e) {}
  }
  const newState = createInitialGameState(normalizedId);
  await redis.set(`game:${normalizedId}`, JSON.stringify(newState));
  return newState;
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
        team.strikes = Math.min(3, team.strikes + 1);
        const sound = team.strikes >= 3 ? 'strike3' : 'buzz';
        game.lastSfx = { id: Math.random().toString(), sound, timestamp: Date.now() };
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
      const rounds: RoundType[] = ['r1', 'r2', 'r3', 'fast_money'];
      const currentIndex = rounds.indexOf(game.currentRound);
      const nextRound = rounds[(currentIndex + 1) % rounds.length];
      game.currentRound = nextRound;
      if (nextRound === 'r1') game.roundMultiplier = 1;
      else if (nextRound === 'r2') game.roundMultiplier = 2;
      else if (nextRound === 'r3') game.roundMultiplier = 3;

      game.currentQuestionIndex = (game.currentQuestionIndex + 1) % game.questions.length;
      // Reset strikes
      game.teams[0].strikes = 0;
      game.teams[1].strikes = 0;
      // Reset answer visibility for new question
      const newQ = game.questions[game.currentQuestionIndex];
      if (newQ) {
        newQ.answers.forEach((a) => (a.revealed = false));
      }
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
      game.teams[0].score = 0;
      game.teams[0].strikes = 0;
      game.teams[1].score = 0;
      game.teams[1].strikes = 0;
      game.currentRound = 'r1';
      game.roundMultiplier = 1;
      game.currentQuestionIndex = 0;
      game.questions.forEach((q) => q.answers.forEach((a) => (a.revealed = false)));
      break;
    }
    case 'LOAD_QUESTION': {
      game.questions[game.currentQuestionIndex] = action.question;
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
          if (action.points !== undefined) ans.points = Math.max(0, action.points);
        }
      }
      break;
    }
    case 'PLAY_SFX': {
      game.lastSfx = { id: Math.random().toString(), sound: action.sound, timestamp: Date.now() };
      break;
    }
    case 'UPDATE_FAST_MONEY': {
      game.fastMoney = { ...game.fastMoney, ...action.payload };
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

// REST API Endpoints
app.get('/api/games/:gameId', async (req, res) => {
  const game = await getOrCreateGame(req.params.gameId);
  res.json({ state: game });
});

app.post('/api/games/:gameId/action', async (req, res) => {
  const gameId = req.params.gameId.toUpperCase().trim();
  const game = await getOrCreateGame(gameId);
  const action = req.body as GameAction;
  const updated = applyGameAction(game, action);
  await redis.set(`game:${gameId}`, JSON.stringify(updated));
  res.json({ state: updated });
});

app.post('/api/games', async (req, res) => {
  const gameId = req.body?.gameId || `FF-${Math.floor(10000 + Math.random() * 90000)}`;
  const normalized = gameId.toUpperCase().trim();
  const game = createInitialGameState(normalized);
  await redis.set(`game:${normalized}`, JSON.stringify(game));
  res.json({ gameId: normalized, state: game });
});

// Setup dev server OR export for Vercel
if (!process.env.VERCEL) {
  async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.join(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`> Studio Primetime Game Server running at http://localhost:${PORT}`);
    });
  }
  startServer();
}

export default app;
