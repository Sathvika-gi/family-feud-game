import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { GameState, GameAction, RoundType, Question, FastMoneyState } from '../types/game';
import { DEFAULT_QUESTIONS, DEFAULT_FAST_MONEY } from '../data/defaultSurveys';
import { playSfx } from '../utils/audio';

type GameContextType = {
  gameState: GameState;
  gameId: string;
  setGameId: (id: string) => void;
  isConnected: boolean;
  latency: number;
  currentPot: number;
  revealedCount: number;
  totalAnswersCount: number;
  currentQuestion?: Question;
  dispatchAction: (action: GameAction) => void;
  // Convenience helpers
  setRound: (round: RoundType) => void;
  setActiveTeam: (teamId: string) => void;
  revealAnswer: (answerId: string) => void;
  hideAnswer: (answerId: string) => void;
  revealAllAnswers: () => void;
  hideAllAnswers: () => void;
  awardPotToTeam: (teamId: string) => void;
  awardAnswerToTeam: (answerId: string, teamId: string) => void;
  adjustTeamScore: (teamId: string, delta: number) => void;
  setTeamScore: (teamId: string, score: number) => void;
  updateTeamInfo: (teamId: string, info: { name?: string; captain?: string; members?: string }) => void;
  addStrike: (teamId: string) => void;
  clearStrikes: (teamId: string) => void;
  nextRound: () => void;
  resetRound: () => void;
  newGame: () => void;
  loadQuestion: (question: Question) => void;
  updateQuestionText: (text: string) => void;
  updateAnswer: (answerId: string, data: { text?: string; points?: number }) => void;
  playSfxDirect: (sound: 'ding' | 'buzz' | 'strike3' | 'bell' | 'fanfare') => void;
  updateFastMoney: (payload: Partial<FastMoneyState>) => void;
  updateFastMoneyAnswer: (questionId: string, player: 1 | 2, answer: string, points: number) => void;
};

const initialFallbackState: GameState = {
  id: 'FF-90210',
  name: 'FAMILY FEUD STUDIO OPERATIONS',
  status: 'playing',
  currentRound: 'r2',
  roundMultiplier: 2,
  currentQuestionIndex: 0,
  currentTeamId: 'team-1',
  teams: [
    {
      id: 'team-1',
      name: 'THE JOHNSONS',
      score: 142,
      captain: 'Marcus',
      members: 'Marcus (Captain), Angela, David, Maya, Trey',
      strikes: 2,
      color: '#00e3fd',
    },
    {
      id: 'team-2',
      name: 'THE MILLERS',
      score: 95,
      captain: 'Sarah',
      members: 'Sarah (Captain), Kevin, Chloe, Liam, Brenda',
      strikes: 0,
      color: '#ffb0b3',
    },
  ],
  questions: JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)),
  fastMoney: JSON.parse(JSON.stringify(DEFAULT_FAST_MONEY)),
  updatedAt: Date.now(),
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Check URL query param ?game=XYZ or default to FF-90210
  const [gameId, setGameIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlGame = params.get('game');
      if (urlGame) return urlGame.toUpperCase();
      const saved = localStorage.getItem('ff_game_id');
      if (saved) return saved.toUpperCase();
    }
    return 'FF-90210';
  });

  const [gameState, setGameState] = useState<GameState>(initialFallbackState);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(12);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const pingStartRef = useRef<number>(0);
  const lastProcessedSfxIdRef = useRef<string>('');

  const setGameId = (newId: string) => {
    const formatted = newId.trim().toUpperCase();
    setGameIdState(formatted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ff_game_id', formatted);
      const url = new URL(window.location.href);
      url.searchParams.set('game', formatted);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Connect WebSocket
  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout: number;

    function connect() {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setIsConnected(true);
          ws.send(JSON.stringify({ type: 'join', gameId, role: 'client' }));

          // Start ping intervals for latency tracking
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = window.setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              pingStartRef.current = Date.now();
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 4000);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'sync' && data.state) {
              setGameState(data.state);
              // Handle sound effects from server
              if (data.state.lastSfx && data.state.lastSfx.id !== lastProcessedSfxIdRef.current) {
                lastProcessedSfxIdRef.current = data.state.lastSfx.id;
                playSfx(data.state.lastSfx.sound);
              }
            } else if (data.type === 'pong') {
              const rtt = Math.max(4, Date.now() - pingStartRef.current);
              setLatency(rtt);
            }
          } catch (e) {
            console.error('Failed to parse WS message', e);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setIsConnected(false);
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          reconnectTimeout = window.setTimeout(connect, 2000);
        };

        ws.onerror = () => {
          if (!isMounted) return;
          setIsConnected(false);
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
        reconnectTimeout = window.setTimeout(connect, 2000);
      }
    }

    connect();

    // Fallback: Initial state fetch via REST API
    fetch(`/api/games/${gameId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.state && isMounted) {
          setGameState(data.state);
        }
      })
      .catch((err) => console.warn('REST fetch initial state error:', err));

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [gameId]);

  // Dispatch Action to server (WebSocket + fallback HTTP)
  const dispatchAction = useCallback(
    (action: GameAction) => {
      // Send through WebSocket if open
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'action', gameId, action }));
      } else {
        // Fallback HTTP POST
        fetch(`/api/games/${gameId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.state) {
              setGameState(data.state);
            }
          })
          .catch((err) => console.error('Failed to send action via HTTP', err));
      }
    },
    [gameId]
  );

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

  // Derived current pot: sum of revealed answers points * multiplier
  const currentPot = useMemo(() => {
    if (!currentQuestion) return 0;
    const revealedSum = currentQuestion.answers
      .filter((a) => a.revealed)
      .reduce((sum, a) => sum + a.points, 0);
    return revealedSum * gameState.roundMultiplier;
  }, [currentQuestion, gameState.roundMultiplier]);

  const revealedCount = useMemo(() => {
    if (!currentQuestion) return 0;
    return currentQuestion.answers.filter((a) => a.revealed).length;
  }, [currentQuestion]);

  const totalAnswersCount = currentQuestion?.answers.length || 0;

  // Action helpers
  const setRound = (round: RoundType) => dispatchAction({ type: 'SET_ROUND', round });
  const setActiveTeam = (teamId: string) => dispatchAction({ type: 'SET_ACTIVE_TEAM', teamId });
  const revealAnswer = (answerId: string) => dispatchAction({ type: 'REVEAL_ANSWER', answerId });
  const hideAnswer = (answerId: string) => dispatchAction({ type: 'HIDE_ANSWER', answerId });
  const revealAllAnswers = () => dispatchAction({ type: 'REVEAL_ALL_ANSWERS' });
  const hideAllAnswers = () => dispatchAction({ type: 'HIDE_ALL_ANSWERS' });
  const awardPotToTeam = (teamId: string) => dispatchAction({ type: 'AWARD_POT_TO_TEAM', teamId });
  const awardAnswerToTeam = (answerId: string, teamId: string) =>
    dispatchAction({ type: 'AWARD_ANSWER_TO_TEAM', answerId, teamId });
  const adjustTeamScore = (teamId: string, delta: number) =>
    dispatchAction({ type: 'ADJUST_TEAM_SCORE', teamId, delta });
  const setTeamScore = (teamId: string, score: number) =>
    dispatchAction({ type: 'SET_TEAM_SCORE', teamId, score });
  const updateTeamInfo = (teamId: string, info: { name?: string; captain?: string; members?: string }) =>
    dispatchAction({ type: 'UPDATE_TEAM_INFO', teamId, ...info });
  const addStrike = (teamId: string) => dispatchAction({ type: 'ADD_STRIKE', teamId });
  const clearStrikes = (teamId: string) => dispatchAction({ type: 'CLEAR_STRIKES', teamId });
  const nextRound = () => dispatchAction({ type: 'NEXT_ROUND' });
  const resetRound = () => dispatchAction({ type: 'RESET_ROUND' });
  const newGame = () => dispatchAction({ type: 'NEW_GAME' });
  const loadQuestion = (question: Question) => dispatchAction({ type: 'LOAD_QUESTION', question });
  const updateQuestionText = (text: string) => dispatchAction({ type: 'UPDATE_QUESTION_TEXT', text });
  const updateAnswer = (answerId: string, data: { text?: string; points?: number }) =>
    dispatchAction({ type: 'UPDATE_ANSWER', answerId, ...data });
  const playSfxDirect = (sound: 'ding' | 'buzz' | 'strike3' | 'bell' | 'fanfare') =>
    dispatchAction({ type: 'PLAY_SFX', sound });
  const updateFastMoney = (payload: Partial<FastMoneyState>) =>
    dispatchAction({ type: 'UPDATE_FAST_MONEY', payload });
  const updateFastMoneyAnswer = (questionId: string, player: 1 | 2, answer: string, points: number) =>
    dispatchAction({ type: 'UPDATE_FAST_MONEY_ANSWER', questionId, player, answer, points });

  return (
    <GameContext.Provider
      value={{
        gameState,
        gameId,
        setGameId,
        isConnected,
        latency,
        currentPot,
        revealedCount,
        totalAnswersCount,
        currentQuestion,
        dispatchAction,
        setRound,
        setActiveTeam,
        revealAnswer,
        hideAnswer,
        revealAllAnswers,
        hideAllAnswers,
        awardPotToTeam,
        awardAnswerToTeam,
        adjustTeamScore,
        setTeamScore,
        updateTeamInfo,
        addStrike,
        clearStrikes,
        nextRound,
        resetRound,
        newGame,
        loadQuestion,
        updateQuestionText,
        updateAnswer,
        playSfxDirect,
        updateFastMoney,
        updateFastMoneyAnswer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
