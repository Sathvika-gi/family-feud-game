import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import {
  Users,
  Radio,
  Tv,
  Cast,
  Maximize2,
  Minimize2,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function StageGameboard() {
  const {
    gameState,
    currentQuestion,
    currentPot,
    revealedCount,
    totalAnswersCount,
    awardPotToTeam,
    revealAnswer,
    addStrike,
    clearStrikes,
    gameId,
  } = useGame();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const team1 = gameState.teams[0];
  const team2 = gameState.teams[1];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Launch confetti on fanfare / win
  useEffect(() => {
    if (gameState.lastSfx?.sound === 'fanfare') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffb800', '#00e3fd', '#ffffff', '#ffd7d8'],
      });
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastSfx]);

  // Find next unrevealed answer for Director quick bar
  const nextUnrevealed = currentQuestion?.answers.find((a) => !a.revealed);

  // Split answers: Col 1 has 1..4, Col 2 has 5..8
  const leftAnswers = currentQuestion?.answers.slice(0, 4) || [];
  const rightAnswers = currentQuestion?.answers.slice(4, 8) || [];

  const roundMultiplierText =
    gameState.roundMultiplier === 1
      ? 'SINGLE POINTS (×1)'
      : gameState.roundMultiplier === 2
      ? 'DOUBLE POINTS (×2)'
      : 'TRIPLE POINTS (×3)';

  const activeTeam = gameState.teams.find((t) => t.id === gameState.currentTeamId) || team1;

  return (
    <div className="max-w-[1600px] mx-auto p-3 md:p-6 space-y-4 md:space-y-6 select-none">
      {/* Top Transmission Feed & Accumulated Pot Bar */}
      <div className="bg-[#171b29] border border-[#252a38] rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-[#ffb800]/10 blur-3xl pointer-events-none rounded-full"></div>

        {/* Transmission Feed info */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e3fd] animate-pulse"></span>
            <span className="text-[11px] font-mono-score font-bold uppercase text-[#9e8f78] tracking-wider">
              TRANSMISSION FEED
            </span>
          </div>
          <div className="font-bebas text-lg md:text-xl text-[#bdf4ff] tracking-wide">
            STAGE CH1 • LIVE ON AIR
          </div>
          <div className="text-[11px] font-mono-score text-[#d5c4ab]">
            SURVEY AUDIENCE: <span className="text-[#ffdca1] font-bold">100 PEOPLE SURVEYED</span>
          </div>
        </div>

        {/* Center Accumulated Bank Banner */}
        <div className="flex flex-col items-center">
          {/* Bulb string dots */}
          <div className="flex items-center space-x-3 mb-2">
            {[...Array(7)].map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-[#ffb800] shadow-[0_0_8px_#ffb800] animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              ></span>
            ))}
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3.5 py-0.5 rounded-full bg-[#ffb800]/20 border border-[#ffb800]/60 text-[11px] font-bold font-mono-score text-[#ffdca1] tracking-wider uppercase mb-1">
            <Sparkles className="w-3 h-3 text-[#ffb800]" />
            <span>ROUND {gameState.roundMultiplier} • {roundMultiplierText}</span>
            <Sparkles className="w-3 h-3 text-[#ffb800]" />
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-xs uppercase font-bold text-[#9e8f78] tracking-widest hidden sm:inline">
              ROUND BANK ACCUMULATED
            </span>
            <div className="font-bebas text-5xl md:text-6xl text-[#ffb800] tracking-wider leading-none drop-shadow-[0_0_20px_rgba(255,184,0,0.4)]">
              {currentPot}
            </div>
            <span className="font-bebas text-2xl text-[#ffdca1]">PTS</span>
          </div>
        </div>

        {/* Right Sync status & Fullscreen toggle */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono-score uppercase text-[#9e8f78] tracking-wider">
              CONTROL SYNC
            </div>
            <div className="text-xs font-bold text-[#00e3fd] uppercase tracking-wide flex items-center justify-end space-x-1.5">
              <span>DIRECTOR OVERRIDE ACTIVE</span>
              <Cast className="w-3.5 h-3.5 text-[#00e3fd]" />
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-lg bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] border border-[#514532] transition-colors"
            title="Toggle Stage Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* THREE-COLUMN STAGE BROADCAST VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT POD: TEAM 1 (THE JOHNSONS) */}
        <div className="lg:col-span-3 bg-[#171b29] border-2 border-[#00e3fd]/60 rounded-2xl p-4 md:p-5 shadow-[0_0_25px_rgba(0,227,253,0.15)] relative overflow-hidden flex flex-col justify-between min-h-[520px]">
          {/* Top In Control Pill */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#00e3fd] uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#00e3fd]" />
              <span>{gameState.currentTeamId === team1.id ? 'CONTROL OF BOARD' : 'STAGE LEFT'}</span>
            </div>
            <span className="text-[10px] font-mono-score font-bold bg-[#00e3fd]/20 text-[#bdf4ff] px-2 py-0.5 rounded border border-[#00e3fd]/30">
              5 PLAYERS
            </span>
          </div>

          {/* Team Name */}
          <h2 className="font-bebas text-3xl md:text-4xl text-[#dee2f5] tracking-wide mb-2 text-center">
            {team1.name}
          </h2>

          {/* Stylized Family Portrait Graphic */}
          <div className="relative w-full h-32 md:h-36 rounded-xl overflow-hidden bg-[#0e1320] border border-[#252a38] flex items-center justify-center p-2 mb-3">
            {/* Visual stage lights background */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1320] via-transparent to-[#00e3fd]/20"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex -space-x-3 mb-2">
                {['M', 'A', 'D', 'M', 'T'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-b from-[#252a38] to-[#0e1320] border-2 border-[#00e3fd] flex items-center justify-center font-bebas text-lg text-[#00e3fd] shadow-md"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-space text-[#ffdca1] font-semibold text-center">
                ● CAPTAIN: {team1.captain || 'MARCUS'}
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className="text-center py-2 bg-[#0e1320] rounded-xl border border-[#303443] mb-3">
            <div className="text-[11px] font-mono-score uppercase text-[#9e8f78] tracking-widest">
              TOTAL MATCH SCORE
            </div>
            <div className="font-mono-score text-5xl md:text-6xl font-bold text-[#00e3fd] leading-none my-1 tracking-tight">
              {String(team1.score).padStart(3, '0')}
            </div>
            <div className="text-[10px] font-space font-semibold uppercase text-[#9e8f78] tracking-wider">
              POINTS EARNED
            </div>
          </div>

          {/* Team Strikes */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs font-mono-score text-[#9e8f78]">
              <span>TEAM STRIKES</span>
              <span className="text-[#ffb4ab] font-bold">
                {team1.strikes} OUT OF 3
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((index) => {
                const hasStrike = team1.strikes >= index;
                return (
                  <div
                    key={index}
                    className={`h-14 rounded-lg flex items-center justify-center font-bebas text-3xl font-bold transition-all ${
                      hasStrike
                        ? 'bg-[#93000a] text-[#ffdad6] border-2 border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                        : 'bg-[#0e1320] text-[#303443] border border-[#252a38]'
                    }`}
                  >
                    {hasStrike ? 'X' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Status Subtext */}
          <div className="pt-2 border-t border-[#252a38] flex items-center justify-between text-[11px] font-mono-score text-[#d5c4ab]">
            <span className="flex items-center space-x-1 text-[#ffdca1]">
              <AlertTriangle className="w-3 h-3 text-[#ffb800]" />
              <span>{team1.strikes === 2 ? 'ONE STRIKE TILL STEAL' : 'IN PLAY'}</span>
            </span>
            <span className="text-[#9e8f78]">BUZZER: 0.42S</span>
          </div>
        </div>

        {/* CENTER POD: THE TOP 8 SURVEY ANSWERS GAMEBOARD */}
        <div className="lg:col-span-6 bg-[#171b29] border border-[#252a38] rounded-2xl p-4 md:p-5 shadow-2xl space-y-4">
          {/* Gameboard Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#252a38]">
            <div className="flex items-center space-x-2">
              <span className="font-bebas text-2xl md:text-3xl text-[#ffdca1] tracking-wider flex items-center gap-2">
                <span className="text-[#ffb800]">≡</span> TOP 8 SURVEY ANSWERS
              </span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0e1320] border border-[#303443] text-xs font-mono-score text-[#00e3fd]">
              <span className="w-2 h-2 rounded-full bg-[#00e3fd] animate-pulse"></span>
              <span>BOARD ACTIVE</span>
            </div>
          </div>

          {/* 8 Survey Answer Flippers (2 Columns of 4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[380px]">
            {/* Left Column (1..4) */}
            <div className="space-y-3">
              {leftAnswers.map((answer) => (
                <div
                  key={answer.id}
                  onClick={() => (answer.revealed ? null : revealAnswer(answer.id))}
                  className="perspective-1000 cursor-pointer h-20"
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                      answer.revealed ? '' : ''
                    }`}
                  >
                    {answer.revealed ? (
                      /* Revealed Face */
                      <div className="w-full h-full rounded-xl bg-gradient-to-r from-[#172033] to-[#1e2a44] border-2 border-[#ffb800] flex items-center justify-between px-3 md:px-4 shadow-[0_0_15px_rgba(255,184,0,0.25)]">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <span className="w-8 h-8 rounded bg-[#090e1b] text-[#ffdca1] font-mono-score font-bold flex items-center justify-center text-sm border border-[#ffb800]/40">
                            {answer.rank}
                          </span>
                          <span className="font-bebas text-xl md:text-2xl text-[#ffffff] tracking-wide truncate uppercase">
                            {answer.text}
                          </span>
                        </div>
                        <div className="font-bebas text-3xl md:text-4xl text-black bg-[#ffb800] px-3.5 py-1 rounded-md font-bold shadow-inner min-w-[55px] text-center leading-none">
                          {answer.points}
                        </div>
                      </div>
                    ) : (
                      /* Hidden Face (Classic metallic blue tile with gold number) */
                      <div className="w-full h-full rounded-xl bg-gradient-to-b from-[#131b2e] to-[#0a1020] border-2 border-[#25324d] hover:border-[#ffb800]/60 flex items-center justify-center shadow-lg transition-colors group">
                        <div className="w-14 h-14 rounded-full bg-[#090e1b] border-2 border-[#ffb800]/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                          <span className="font-bebas text-3xl md:text-4xl text-[#ffdca1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">
                            {answer.rank}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column (5..8) */}
            <div className="space-y-3">
              {rightAnswers.map((answer) => (
                <div
                  key={answer.id}
                  onClick={() => (answer.revealed ? null : revealAnswer(answer.id))}
                  className="perspective-1000 cursor-pointer h-20"
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                      answer.revealed ? '' : ''
                    }`}
                  >
                    {answer.revealed ? (
                      /* Revealed Face */
                      <div className="w-full h-full rounded-xl bg-gradient-to-r from-[#172033] to-[#1e2a44] border-2 border-[#ffb800] flex items-center justify-between px-3 md:px-4 shadow-[0_0_15px_rgba(255,184,0,0.25)]">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <span className="w-8 h-8 rounded bg-[#090e1b] text-[#ffdca1] font-mono-score font-bold flex items-center justify-center text-sm border border-[#ffb800]/40">
                            {answer.rank}
                          </span>
                          <span className="font-bebas text-xl md:text-2xl text-[#ffffff] tracking-wide truncate uppercase">
                            {answer.text}
                          </span>
                        </div>
                        <div className="font-bebas text-3xl md:text-4xl text-black bg-[#ffb800] px-3.5 py-1 rounded-md font-bold shadow-inner min-w-[55px] text-center leading-none">
                          {answer.points}
                        </div>
                      </div>
                    ) : (
                      /* Hidden Face */
                      <div className="w-full h-full rounded-xl bg-gradient-to-b from-[#131b2e] to-[#0a1020] border-2 border-[#25324d] hover:border-[#ffb800]/60 flex items-center justify-center shadow-lg transition-colors group">
                        <div className="w-14 h-14 rounded-full bg-[#090e1b] border-2 border-[#ffb800]/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                          <span className="font-bebas text-3xl md:text-4xl text-[#ffdca1] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">
                            {answer.rank}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom "SURVEY SAYS" Question Display */}
          <div className="bg-[#0e1320] border border-[#ffb800]/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
              <div className="bg-[#ffb800] text-black font-bebas text-base font-bold px-2.5 py-1 rounded tracking-wider leading-none shadow">
                SURVEY SAYS
              </div>
              <div className="font-space text-sm md:text-base text-[#dee2f5] font-semibold italic">
                "{currentQuestion?.text || 'Loading survey question...'}"
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono-score text-[#ffb800] font-bold">
                {currentQuestion?.totalRespondents || 100} TOTAL PTS
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT POD: TEAM 2 (THE MILLERS) */}
        <div className="lg:col-span-3 bg-[#171b29] border-2 border-[#ffb800]/60 rounded-2xl p-4 md:p-5 shadow-[0_0_25px_rgba(255,184,0,0.15)] relative overflow-hidden flex flex-col justify-between min-h-[520px]">
          {/* Top Pill */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#ffb800] uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#ffb800]" />
              <span>{gameState.currentTeamId === team2.id ? 'CONTROL OF BOARD' : 'CHALLENGER FAMILY'}</span>
            </div>
            <span className="text-[10px] font-mono-score font-bold bg-[#ffb800]/20 text-[#ffdca1] px-2 py-0.5 rounded border border-[#ffb800]/30">
              5 PLAYERS
            </span>
          </div>

          {/* Team Name */}
          <h2 className="font-bebas text-3xl md:text-4xl text-[#dee2f5] tracking-wide mb-2 text-center">
            {team2.name}
          </h2>

          {/* Stylized Family Portrait Graphic */}
          <div className="relative w-full h-32 md:h-36 rounded-xl overflow-hidden bg-[#0e1320] border border-[#252a38] flex items-center justify-center p-2 mb-3">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1320] via-transparent to-[#ffb800]/20"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex -space-x-3 mb-2">
                {['S', 'K', 'C', 'L', 'B'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-b from-[#252a38] to-[#0e1320] border-2 border-[#ffb800] flex items-center justify-center font-bebas text-lg text-[#ffb800] shadow-md"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-space text-[#ffdca1] font-semibold text-center">
                ● CAPTAIN: {team2.captain || 'SARAH'}
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className="text-center py-2 bg-[#0e1320] rounded-xl border border-[#303443] mb-3">
            <div className="text-[11px] font-mono-score uppercase text-[#9e8f78] tracking-widest">
              TOTAL MATCH SCORE
            </div>
            <div className="font-mono-score text-5xl md:text-6xl font-bold text-[#ffb800] leading-none my-1 tracking-tight">
              {String(team2.score).padStart(3, '0')}
            </div>
            <div className="text-[10px] font-space font-semibold uppercase text-[#9e8f78] tracking-wider">
              POINTS EARNED
            </div>
          </div>

          {/* Team Strikes */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs font-mono-score text-[#9e8f78]">
              <span>TEAM STRIKES</span>
              <span className="text-[#ffdca1] font-bold">
                {team2.strikes > 0 ? `${team2.strikes} OUT OF 3` : 'READY TO STEAL'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((index) => {
                const hasStrike = team2.strikes >= index;
                return (
                  <div
                    key={index}
                    className={`h-14 rounded-lg flex items-center justify-center font-bebas text-3xl font-bold transition-all ${
                      hasStrike
                        ? 'bg-[#93000a] text-[#ffdad6] border-2 border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                        : 'bg-[#0e1320] text-[#303443] border border-[#252a38]'
                    }`}
                  >
                    {hasStrike ? 'X' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Status Subtext */}
          <div className="pt-2 border-t border-[#252a38] flex items-center justify-between text-[11px] font-mono-score text-[#d5c4ab]">
            <span className="flex items-center space-x-1 text-[#ffdca1]">
              <Lock className="w-3 h-3 text-[#ffb800]" />
              <span>HUDDLE ACTIVE</span>
            </span>
            <span className="text-[#9e8f78]">BUZZER: 0.58S</span>
          </div>
        </div>
      </div>

      {/* BOTTOM DIRECTOR QUICK BAR (Matches Screenshot 2 footer!) */}
      <div className="bg-[#171b29] border border-[#252a38] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#93000a] border border-[#ef4444] flex items-center justify-center text-[#ffdad6]">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bebas text-lg text-[#dee2f5] tracking-wider">
                ROUND VOLATILITY: {team1.strikes >= 2 || team2.strikes >= 2 ? 'CRITICAL' : 'STABLE'}
              </span>
              <span className="text-[10px] font-bold font-mono-score bg-[#93000a]/40 text-[#ffdad6] border border-[#ef4444]/60 px-2 py-0.5 rounded uppercase">
                {activeTeam.strikes} STRIKES
              </span>
            </div>
            <div className="text-xs text-[#9e8f78]">
              {activeTeam.name} risk a sudden steal if they miss. The challengers are huddled.
            </div>
          </div>
        </div>

        {/* Quick actions for Director */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => addStrike(activeTeam.id)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#93000a]/30 hover:bg-[#93000a]/60 text-[#ffb4ab] text-xs font-bold uppercase border border-[#ffb4ab]/40 transition-colors"
          >
            <span>✖ TRIGGER STRIKE {Math.min(3, activeTeam.strikes + 1)}</span>
          </button>

          {nextUnrevealed && (
            <button
              onClick={() => revealAnswer(nextUnrevealed.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#ffb800] hover:bg-[#ffc633] text-black text-xs font-bold uppercase transition-colors shadow-md"
            >
              <span>👁 REVEAL #{nextUnrevealed.rank} ({nextUnrevealed.text})</span>
            </button>
          )}

          <button
            onClick={() => awardPotToTeam(activeTeam.id)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#0e1320] hover:bg-[#252a38] text-[#00e3fd] text-xs font-bold uppercase border border-[#00e3fd]/40 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-[#00e3fd]" />
            <span>AWARD BANK PTS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
