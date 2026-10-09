export type Answer = {
  id: string;
  rank: number;
  text: string;
  points: number;
  revealed: boolean;
};

export type Question = {
  id: string;
  surveyId: string;
  text: string;
  totalRespondents: number;
  answers: Answer[];
};

export type Team = {
  id: string;
  name: string;
  score: number;
  captain: string;
  members: string;
  strikes: number; // 0, 1, 2, or 3
  color: string;
};

export type RoundType = 'r1' | 'r2' | 'r3' | 'fast_money';

export type GameStatus = 'lobby' | 'playing' | 'finished';

export type FastMoneyQuestion = {
  id: string;
  text: string;
  player1Answer: string;
  player1Points: number;
  player2Answer: string;
  player2Points: number;
};

export type FastMoneyState = {
  activePlayer: 1 | 2;
  timerSeconds: number;
  isTimerRunning: boolean;
  questions: FastMoneyQuestion[];
  targetScore: number;
};

export type GameState = {
  id: string;
  name: string;
  status: GameStatus;
  currentRound: RoundType;
  roundMultiplier: number; // 1, 2, or 3
  currentQuestionIndex: number;
  currentTeamId: string | null; // active team in control
  teams: [Team, Team];
  questions: Question[];
  fastMoney: FastMoneyState;
  updatedAt: number;
  winnerTeamId?: string | null;
  lastSfx?: {
    id: string;
    sound: 'ding' | 'buzz' | 'strike3' | 'bell' | 'fanfare';
    timestamp: number;
  };
};

export type GameAction =
  | { type: 'SET_ACTIVE_TEAM'; teamId: string }
  | { type: 'SET_ROUND'; round: RoundType }
  | { type: 'REVEAL_ANSWER'; answerId: string }
  | { type: 'HIDE_ANSWER'; answerId: string }
  | { type: 'REVEAL_ALL_ANSWERS' }
  | { type: 'HIDE_ALL_ANSWERS' }
  | { type: 'AWARD_POT_TO_TEAM'; teamId: string }
  | { type: 'TRIGGER_FINAL_CALL'; teamId: string }
  | { type: 'CLEAR_FINAL_CALL' }
  | { type: 'AWARD_ANSWER_TO_TEAM'; answerId: string; teamId: string }
  | { type: 'ADJUST_TEAM_SCORE'; teamId: string; delta: number }
  | { type: 'SET_TEAM_SCORE'; teamId: string; score: number }
  | { type: 'UPDATE_TEAM_INFO'; teamId: string; name?: string; captain?: string; members?: string }
  | { type: 'ADD_STRIKE'; teamId: string }
  | { type: 'CLEAR_STRIKES'; teamId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_ROUND' }
  | { type: 'NEW_GAME' }
  | { type: 'LOAD_QUESTION'; question: Question }
  | { type: 'UPDATE_QUESTION_TEXT'; text: string }
  | { type: 'UPDATE_ANSWER'; answerId: string; text?: string; points?: number }
  | { type: 'PLAY_SFX'; sound: 'ding' | 'buzz' | 'strike3' | 'bell' | 'fanfare' }
  | { type: 'UPDATE_FAST_MONEY'; payload: Partial<FastMoneyState> }
  | { type: 'UPDATE_FAST_MONEY_ANSWER'; questionId: string; player: 1 | 2; answer: string; points: number };
