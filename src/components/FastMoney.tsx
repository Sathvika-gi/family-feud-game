import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Play, Pause, RotateCcw, Trophy, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export function FastMoney() {
  const { gameState, updateFastMoney, updateFastMoneyAnswer, playSfxDirect } = useGame();
  const fastMoney = gameState.fastMoney;

  const [activePlayer, setActivePlayer] = useState<1 | 2>(fastMoney.activePlayer || 1);
  const [timerSeconds, setTimerSeconds] = useState(fastMoney.timerSeconds || 20);
  const [isRunning, setIsRunning] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: number;
    if (isRunning && timerSeconds > 0) {
      interval = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playSfxDirect('buzz');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds, playSfxDirect]);

  const player1Total = fastMoney.questions.reduce((sum, q) => sum + (q.player1Points || 0), 0);
  const player2Total = fastMoney.questions.reduce((sum, q) => sum + (q.player2Points || 0), 0);
  const combinedTotal = player1Total + player2Total;
  const isGrandPrizeWinner = combinedTotal >= fastMoney.targetScore;

  useEffect(() => {
    if (combinedTotal >= 200) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
      playSfxDirect('fanfare');
    }
  }, [combinedTotal]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = (seconds: number = 20) => {
    setIsRunning(false);
    setTimerSeconds(seconds);
  };

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#171b29] border border-[#ffb800]/50 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-score text-[#ffb800] uppercase font-bold">
            <Award className="w-4 h-4" />
            <span>BONUS ROUND • 200 POINTS TARGET FOR $20,000</span>
          </div>
          <h1 className="font-bebas text-4xl text-[#ffdca1] tracking-wider leading-none mt-1">
            FAST MONEY ROUND
          </h1>
        </div>

        {/* Timer Box */}
        <div className="flex items-center space-x-4 bg-[#0e1320] border-2 border-[#ffb800] rounded-xl px-5 py-2 shadow-inner">
          <Clock className="w-6 h-6 text-[#ffb800]" />
          <div className="text-center">
            <div className="text-[10px] font-mono-score uppercase text-[#9e8f78] tracking-wider">
              ROUND TIMER
            </div>
            <div className={`font-mono-score text-4xl font-bold leading-none ${timerSeconds <= 5 ? 'text-[#ef4444] animate-pulse' : 'text-[#ffdca1]'}`}>
              {String(timerSeconds).padStart(2, '0')}s
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <button
              onClick={toggleTimer}
              className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${
                isRunning ? 'bg-[#93000a] text-white' : 'bg-[#ffb800] text-black'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => resetTimer(activePlayer === 1 ? 20 : 25)}
              className="p-1 rounded bg-[#252a38] text-[#dee2f5] hover:bg-[#343948]"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Combined Points Total */}
        <div className="text-right">
          <div className="text-[10px] font-mono-score uppercase text-[#9e8f78] tracking-wider">
            TOTAL SCORE (TARGET 200)
          </div>
          <div className={`font-bebas text-5xl font-bold leading-none ${isGrandPrizeWinner ? 'text-[#00e3fd]' : 'text-[#ffb800]'}`}>
            {combinedTotal} <span className="text-2xl text-[#dee2f5]">/ 200 PTS</span>
          </div>
        </div>
      </div>

      {/* Player Selector Tabs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            setActivePlayer(1);
            resetTimer(20);
          }}
          className={`flex-1 py-3 px-4 rounded-xl border text-center transition-all ${
            activePlayer === 1
              ? 'bg-[#1b1f2d] border-[#00e3fd] text-[#00e3fd] shadow-[0_0_15px_rgba(0,227,253,0.2)]'
              : 'bg-[#171b29] border-[#252a38] text-[#9e8f78]'
          }`}
        >
          <div className="text-xs uppercase font-bold font-mono-score">PLAYER 1</div>
          <div className="font-bebas text-2xl text-[#dee2f5]">{player1Total} POINTS (20 SECONDS)</div>
        </button>

        <button
          onClick={() => {
            setActivePlayer(2);
            resetTimer(25);
          }}
          className={`flex-1 py-3 px-4 rounded-xl border text-center transition-all ${
            activePlayer === 2
              ? 'bg-[#1b1f2d] border-[#ffb800] text-[#ffb800] shadow-[0_0_15px_rgba(255,184,0,0.2)]'
              : 'bg-[#171b29] border-[#252a38] text-[#9e8f78]'
          }`}
        >
          <div className="text-xs uppercase font-bold font-mono-score">PLAYER 2</div>
          <div className="font-bebas text-2xl text-[#dee2f5]">{player2Total} POINTS (25 SECONDS)</div>
        </button>
      </div>

      {/* 5 Questions Table */}
      <div className="bg-[#171b29] border border-[#252a38] rounded-xl p-5 shadow-lg space-y-4">
        <div className="grid grid-cols-12 gap-4 pb-2 border-b border-[#252a38] text-[11px] font-mono-score font-bold uppercase text-[#9e8f78]">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">SURVEY QUESTION</div>
          <div className="col-span-3 text-center text-[#00e3fd]">PLAYER 1 ANSWER & PTS</div>
          <div className="col-span-3 text-center text-[#ffb800]">PLAYER 2 ANSWER & PTS</div>
        </div>

        {fastMoney.questions.map((q, idx) => (
          <div
            key={q.id}
            className="grid grid-cols-12 gap-4 items-center bg-[#1b1f2d] p-3 rounded-lg border border-[#303443]"
          >
            <div className="col-span-1 text-center font-mono-score font-bold text-lg text-[#ffdca1]">
              {idx + 1}
            </div>

            <div className="col-span-5 font-bebas text-lg text-[#dee2f5]">
              {q.text}
            </div>

            {/* Player 1 inputs */}
            <div className="col-span-3 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Answer..."
                value={q.player1Answer}
                onChange={(e) =>
                  updateFastMoneyAnswer(q.id, 1, e.target.value.toUpperCase(), q.player1Points)
                }
                className="w-full bg-[#0e1320] border border-[#303443] rounded px-2.5 py-1 text-xs font-bebas uppercase text-[#00e3fd] focus:outline-none focus:border-[#00e3fd]"
              />
              <input
                type="number"
                placeholder="Pts"
                value={q.player1Points}
                onChange={(e) =>
                  updateFastMoneyAnswer(q.id, 1, q.player1Answer, parseInt(e.target.value) || 0)
                }
                className="w-14 bg-[#0e1320] border border-[#303443] rounded px-1.5 py-1 text-xs font-mono-score font-bold text-center text-[#00e3fd] focus:outline-none"
              />
            </div>

            {/* Player 2 inputs */}
            <div className="col-span-3 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Answer..."
                value={q.player2Answer}
                onChange={(e) =>
                  updateFastMoneyAnswer(q.id, 2, e.target.value.toUpperCase(), q.player2Points)
                }
                className="w-full bg-[#0e1320] border border-[#303443] rounded px-2.5 py-1 text-xs font-bebas uppercase text-[#ffb800] focus:outline-none focus:border-[#ffb800]"
              />
              <input
                type="number"
                placeholder="Pts"
                value={q.player2Points}
                onChange={(e) =>
                  updateFastMoneyAnswer(q.id, 2, q.player2Answer, parseInt(e.target.value) || 0)
                }
                className="w-14 bg-[#0e1320] border border-[#303443] rounded px-1.5 py-1 text-xs font-mono-score font-bold text-center text-[#ffb800] focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
