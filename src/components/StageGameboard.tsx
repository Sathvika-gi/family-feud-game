import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Users, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StageGameboardProps {
  onSwitchToHost?: () => void;
}

function getDynamicAnswerFontSize(text?: string | null): string {
  if (!text) return 'text-xl md:text-2xl lg:text-3xl';
  const clean = String(text).trim();
  if (!clean) return 'text-xl md:text-2xl lg:text-3xl';
  const words = clean.split(/\s+/);
  const maxWordLen = words.length > 0 ? Math.max(...words.map((w) => w.length), 0) : 0;
  const totalLen = clean.length;

  // Single long words (>= 12 chars, e.g. "REGISTRATION", "TELEPORTATION", "INVISIBILITY")
  if (maxWordLen >= 12) {
    return 'text-sm md:text-base lg:text-lg';
  }
  // Single medium-long words (9 - 11 chars, e.g. "SUNGLASSES", "FLASHLIGHT", "TOOTHBRUSH", "MEDICATION")
  // Sized to comfortably fit on 1 single line without breaking
  if (maxWordLen >= 9) {
    return 'text-base md:text-lg lg:text-[1.35rem]';
  }
  // Very long phrases (>= 25 characters total)
  if (totalLen >= 25) {
    return 'text-sm md:text-base lg:text-lg';
  }
  // Moderate phrases (15 - 24 characters total, e.g. "OWNERS MANUAL", "TIRE PRESSURE")
  if (totalLen >= 15) {
    return 'text-base md:text-lg lg:text-xl';
  }
  // Short phrases / words (8 - 14 characters total)
  if (totalLen >= 8) {
    return 'text-lg md:text-xl lg:text-2xl';
  }
  // Very short words (<= 7 characters, e.g. "BEDROOM", "BEACH", "HOUSE", "BED")
  return 'text-xl md:text-2xl lg:text-3xl';
}

export function StageGameboard({ onSwitchToHost }: StageGameboardProps = {}) {
  const {
    gameState,
    currentQuestion,
    revealedCount,
    totalAnswersCount,
    gameId,
  } = useGame();

  const [showStrikeOverlay, setShowStrikeOverlay] = useState(false);

  const team1 = gameState.teams[0] || { id: 'team-1', name: 'TEAM 1', score: 0, strikes: 0, color: '#00e3fd' };
  const team2 = gameState.teams[1] || { id: 'team-2', name: 'TEAM 2', score: 0, strikes: 0, color: '#ffb800' };

  const isTeam1Winner = gameState.winnerTeamId === team1?.id;
  const isTeam2Winner = gameState.winnerTeamId === team2?.id;
  const hasWinner = Boolean(gameState.winnerTeamId);
  const winnerTeam = gameState.teams.find((t) => t.id === gameState.winnerTeamId);

  // Target celebratory confetti shower directly over that particular winning participant
  useEffect(() => {
    if (!gameState.winnerTeamId) return;

    const isTeam1 = gameState.winnerTeamId === team1?.id || gameState.winnerTeamId === 'team-1';
    // Pod horizontal centers: Stage Left ~0.16, Stage Right ~0.84
    const targetX = isTeam1 ? 0.16 : 0.84;
    const teamColors = isTeam1
      ? ['#00e3fd', '#38bdf8', '#ffffff', '#ffdca1', '#0284c7']
      : ['#ffb800', '#f59e0b', '#ffffff', '#ffdca1', '#d97706'];

    // 1. Initial downward shower burst directly above the participant pod
    confetti({
      particleCount: 100,
      angle: 270, // Rains DOWNWARDS over the participant
      spread: 75,
      origin: { x: targetX, y: 0.0 },
      colors: teamColors,
      gravity: 1.3,
      scalar: 1.2,
      startVelocity: 25,
      ticks: 350,
      zIndex: 99999,
    });

    // 2. Angled cannon firing upwards from side towards that participant pod
    confetti({
      particleCount: 80,
      angle: isTeam1 ? 55 : 125, // Arc inward towards the pod
      spread: 55,
      origin: { x: isTeam1 ? 0.02 : 0.98, y: 0.65 },
      colors: teamColors,
      gravity: 1.1,
      scalar: 1.1,
      startVelocity: 42,
      ticks: 350,
      zIndex: 99999,
    });

    // 3. Cascading continuous shower raining down on that participant for 5 seconds
    const showerInterval = setInterval(() => {
      const jitterX = targetX + (Math.random() - 0.5) * 0.12;
      confetti({
        particleCount: 40,
        angle: 270, // Rains DOWNWARDS
        spread: 65,
        origin: { x: jitterX, y: -0.05 },
        colors: teamColors,
        gravity: 1.3,
        scalar: 1.15,
        startVelocity: 20,
        ticks: 300,
        zIndex: 99999,
      });
    }, 280);

    const stopTimer = setTimeout(() => {
      clearInterval(showerInterval);
    }, 5000);

    return () => {
      clearInterval(showerInterval);
      clearTimeout(stopTimer);
    };
  }, [gameState.winnerTeamId, gameState.lastSfx?.id, team1?.id]);

  // General fanfare celebration if triggered without a specific winner
  useEffect(() => {
    if (gameState.lastSfx?.sound === 'fanfare' && !gameState.winnerTeamId) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffb800', '#00e3fd', '#ffffff', '#ffd7d8'],
      });
    }
  }, [gameState.lastSfx, gameState.winnerTeamId]);

  // Full-screen iconic X on strike / buzz
  useEffect(() => {
    if (gameState.lastSfx?.sound === 'buzz' || gameState.lastSfx?.sound === 'strike3') {
      setShowStrikeOverlay(true);
      const timer = setTimeout(() => setShowStrikeOverlay(false), 1600);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastSfx]);

  // Normalize exactly 8 slots (1..4 on Left, 5..8 on Right) to eliminate blank missing holes
  const leftSlots = [1, 2, 3, 4].map(
    (rank) => currentQuestion?.answers.find((a) => a.rank === rank) || null
  );
  const rightSlots = [5, 6, 7, 8].map(
    (rank) => currentQuestion?.answers.find((a) => a.rank === rank) || null
  );

  const activeTeam = gameState.teams.find((t) => t.id === gameState.currentTeamId) || team1;
  const isTeam1Active = gameState.currentTeamId === team1?.id;
  const isTeam2Active = gameState.currentTeamId === team2?.id;

  return (
    <div className="w-full max-w-[1920px] mx-auto p-2 md:p-5 min-h-[calc(100vh-1rem)] flex flex-col justify-center select-none relative cursor-default pointer-events-none">
      {/* Fullscreen iconic Family Feud X overlay */}
      {showStrikeOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-100 select-none">
          <div className="relative flex flex-col items-center justify-center animate-pulse">
            <div className="absolute w-[450px] h-[450px] rounded-full bg-[#ef4444]/30 blur-3xl pointer-events-none" />
            <div className="font-bebas text-[22rem] md:text-[34rem] font-black text-[#ef4444] leading-none drop-shadow-[0_0_100px_rgba(239,68,68,1)]">
              ✕
            </div>
            <div className="font-bebas text-3xl md:text-5xl text-[#ffdad6] tracking-widest uppercase bg-[#93000a] px-8 py-2 rounded-xl border-2 border-[#ef4444] shadow-[0_0_30px_rgba(239,68,68,0.8)] -mt-10">
              STRIKE!
            </div>
          </div>
        </div>
      )}

      {/* Floating Winner Pill Banner (Pure broadcast display banner) */}
      {winnerTeam && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-3 bg-[#171b29]/95 border-2 border-[#ffb800] px-6 py-2.5 rounded-full shadow-[0_0_35px_rgba(255,184,0,0.6)] backdrop-blur-md animate-in slide-in-from-top duration-300">
          <Trophy className="w-5 h-5 text-[#ffb800] animate-bounce shrink-0" />
          <span className="font-bebas text-xl md:text-2xl tracking-wider text-[#ffdca1] uppercase">
            FINAL CALL WINNER: {winnerTeam.name}
          </span>
        </div>
      )}

      {/* THREE-COLUMN STAGE BROADCAST VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch w-full flex-1">
        {/* LEFT POD: TEAM 1 */}
        <div
          className={`lg:col-span-3 rounded-2xl p-4 md:p-6 relative overflow-hidden flex flex-col justify-between min-h-[580px] md:min-h-[640px] transition-all duration-300 ${
            isTeam1Winner
              ? 'bg-gradient-to-b from-[#092235] to-[#171b29] border-4 border-[#00e3fd] shadow-[0_0_60px_rgba(0,227,253,0.8)] ring-4 ring-[#00e3fd]/60'
              : isTeam1Active
              ? 'bg-[#171b29] border-2 border-[#00e3fd] shadow-[0_0_35px_rgba(0,227,253,0.35)] ring-2 ring-[#00e3fd]/40'
              : hasWinner
              ? 'bg-[#171b29] border border-[#252a38] opacity-50'
              : 'bg-[#171b29] border border-[#252a38] opacity-80'
          }`}
        >
          {/* Top In Control Pill */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#00e3fd] uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#00e3fd]" />
              <span>STAGE LEFT</span>
            </div>
            <span className="text-[10px] font-mono-score font-bold bg-[#00e3fd]/20 text-[#bdf4ff] px-2 py-0.5 rounded border border-[#00e3fd]/30">
              5 PLAYERS
            </span>
          </div>

          {/* HIGHLY EXPOSED IN PLAY / FINAL CALL WINNER BANNER */}
          {isTeam1Winner ? (
            <div className="mb-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00e3fd] via-[#38bdf8] to-[#00e3fd] text-black font-bebas text-2xl md:text-3xl tracking-widest uppercase flex items-center justify-center space-x-2 shadow-[0_0_35px_rgba(0,227,253,0.9)] animate-pulse">
              <Trophy className="w-6 h-6 text-black fill-black" />
              <span>★ FINAL CALL WINNER ★</span>
              <Trophy className="w-6 h-6 text-black fill-black" />
            </div>
          ) : isTeam1Active ? (
            <div className="mb-3 py-2 px-3 rounded-xl bg-gradient-to-r from-[#00e3fd]/30 via-[#00e3fd]/15 to-[#00e3fd]/30 border-2 border-[#00e3fd] shadow-[0_0_25px_rgba(0,227,253,0.5)] flex items-center justify-center space-x-2.5 animate-pulse">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e3fd] opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00e3fd] shadow-[0_0_8px_#00e3fd]"></span>
              </span>
              <span className="font-bebas text-2xl md:text-3xl tracking-widest uppercase font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                ★ IN PLAY ★
              </span>
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e3fd] opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00e3fd] shadow-[0_0_8px_#00e3fd]"></span>
              </span>
            </div>
          ) : (
            <div className="mb-3 py-1.5 px-3 rounded-xl bg-[#0e1320] border border-[#252a38] text-[#9e8f78] flex items-center justify-center space-x-1.5 text-xs font-mono-score font-semibold uppercase">
              <span>ON DECK / WAITING</span>
            </div>
          )}

          {/* Team Name */}
          <h2 className="font-bebas text-3xl md:text-5xl text-[#dee2f5] tracking-wide my-1 text-center">
            {team1.name}
          </h2>

          {/* Stylized Family Portrait Graphic */}
          <div className="relative w-full h-36 md:h-44 rounded-xl overflow-hidden bg-[#0e1320] border border-[#252a38] flex items-center justify-center p-3 my-2">
            {isTeam1Winner && (
              <div className="absolute top-2 right-2 z-20 w-11 h-11 rounded-full bg-[#00e3fd] border-2 border-white flex items-center justify-center shadow-[0_0_25px_#00e3fd] animate-bounce">
                <Trophy className="w-6 h-6 text-black fill-black" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1320] via-transparent to-[#00e3fd]/20"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex -space-x-3 mb-3">
                {['M', 'A', 'D', 'M', 'T'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 md:w-13 md:h-13 rounded-full bg-gradient-to-b from-[#252a38] to-[#0e1320] border-2 border-[#00e3fd] flex items-center justify-center font-bebas text-xl md:text-2xl text-[#00e3fd] shadow-md"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div className="text-xs font-space text-[#ffdca1] font-semibold text-center">
                ● CAPTAIN: {team1.captain || 'MARCUS'}
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className="text-center py-4 md:py-6 bg-[#0e1320] rounded-xl border border-[#303443] my-2">
            <div className="text-[11px] font-mono-score uppercase text-[#9e8f78] tracking-widest">
              TOTAL MATCH SCORE
            </div>
            <div className="font-mono-score text-6xl md:text-7xl font-bold text-[#00e3fd] leading-none my-1 tracking-tight">
              {String(team1.score).padStart(3, '0')}
            </div>
            <div className="text-[11px] font-space font-semibold uppercase text-[#9e8f78] tracking-wider">
              POINTS EARNED
            </div>
          </div>

          {/* Team Strike (Single Strike) */}
          <div className="space-y-1.5 my-2">
            <div className="flex items-center justify-between text-xs font-mono-score text-[#9e8f78]">
              <span>TEAM STRIKE</span>
              <span className={team1.strikes > 0 ? 'text-[#ef4444] font-bold' : 'text-[#9e8f78]'}>
                {team1.strikes > 0 ? 'STRIKE INCURRED' : 'CLEAR'}
              </span>
            </div>
            <div
              className={`h-16 md:h-20 rounded-xl flex items-center justify-center font-bebas text-5xl md:text-6xl font-bold transition-all ${team1.strikes > 0
                ? 'bg-[#93000a] text-[#ffdad6] border-2 border-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.7)]'
                : 'bg-[#0e1320] text-[#303443] border border-[#252a38]'
                }`}
            >
              {team1.strikes > 0 ? '✕' : ''}
            </div>
          </div>

          {/* Stage Status Subtext / Prominent IN PLAY indicator */}
          <div className="pt-2.5 border-t border-[#252a38]">
            {isTeam1Winner ? (
              <div className="py-2.5 px-3 rounded-xl bg-[#00e3fd] text-black border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(0,227,253,0.8)] font-bebas text-lg md:text-xl tracking-wider space-x-2">
                <Sparkles className="w-5 h-5 fill-black" />
                <span>CHAMPIONS</span>
              </div>
            ) : isTeam1Active ? (
              <div className="py-2 px-3 rounded-xl bg-[#00e3fd]/20 border-2 border-[#00e3fd] flex items-center justify-between shadow-[0_0_15px_rgba(0,227,253,0.3)]">
                <span className="flex items-center space-x-2 font-mono-score text-xs font-bold text-[#00e3fd]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e3fd] animate-ping" />
                  <span className="font-bebas text-lg md:text-xl tracking-wider text-white">IN PLAY NOW</span>
                </span>
                <span className="text-[11px] font-mono-score font-bold uppercase text-[#00e3fd] bg-[#00e3fd]/30 px-2 py-0.5 rounded border border-[#00e3fd]/50">
                  {team1.strikes > 0 ? '1 STRIKE' : 'BOARD CONTROL'}
                </span>
              </div>
            ) : (
              <div className="py-2 px-3 rounded-xl bg-[#0e1320] border border-[#252a38] flex items-center justify-between text-[11px] font-mono-score text-[#9e8f78]">
                <span>WAITING FOR TURN</span>
                <span>STAGE LEFT</span>
              </div>
            )}
          </div>
        </div>

        {/* CENTER POD: THE TOP 8 SURVEY ANSWERS GAMEBOARD (ENLARGED) */}
        <div className="lg:col-span-6 bg-[#171b29] border-2 border-[#252a38] rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col justify-between min-h-[580px] md:min-h-[640px]">
          {/* Gameboard Header with Event Branding (Campus Life • Poutpourri) & Live IN PLAY indicator */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#252a38] flex-wrap gap-3">
            <div className="flex items-center space-x-3.5">
              {/* Campus Life Logo */}
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[#1a233a] to-[#0e1320] border-2 border-[#ffb800]/60 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.25)] shrink-0 overflow-hidden">
                <img
                  src="/campus-life-logo.png"
                  alt="Campus Life Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] md:text-xs font-mono-score font-bold uppercase tracking-widest text-[#00e3fd] bg-[#00e3fd]/15 px-2 py-0.5 rounded border border-[#00e3fd]/30">
                    CAMPUS LIFE EEC
                  </span>
                </div>
                <div className="flex items-baseline space-x-2.5 mt-0.5">
                  <h1 className="font-bebas text-3xl md:text-5xl text-[#ffdca1] tracking-wider leading-none drop-shadow-[0_2px_8px_rgba(255,184,0,0.3)]">
                    POUTPOURRI
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border-2 text-xs md:text-sm font-mono-score font-bold tracking-wider uppercase shadow-lg transition-all ${isTeam1Active
                  ? 'bg-[#00e3fd]/20 border-[#00e3fd] text-[#00e3fd] shadow-[0_0_15px_rgba(0,227,253,0.35)]'
                  : 'bg-[#ffb800]/20 border-[#ffb800] text-[#ffb800] shadow-[0_0_15px_rgba(255,184,0,0.35)]'
                  }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-ping ${isTeam1Active ? 'bg-[#00e3fd]' : 'bg-[#ffb800]'
                    }`}
                />
                <span className="text-white font-bebas text-base md:text-lg tracking-widest">
                  IN PLAY:
                </span>
                <span className="font-bold underline decoration-2 underline-offset-2">
                  {activeTeam.name}
                </span>
              </div>
            </div>
          </div>

          {/* 8 Survey Answer Flippers (Enlarged 2 Columns of 4, No Blank Holes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-5 flex-1 my-3">
            {/* Left Column (1..4) */}
            <div className="space-y-3 md:space-y-4 flex flex-col justify-between flex-1">
              {leftSlots.map((answer, idx) => {
                const rankNum = idx + 1;
                if (!answer) {
                  return (
                    <div
                      key={`empty-${rankNum}`}
                      className="h-22 md:h-26 lg:h-30 rounded-2xl bg-[#090e1b]/40 border-2 border-[#252a38]/60 border-dashed flex items-center justify-center select-none opacity-25"
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0e1320] border border-[#252a38] flex items-center justify-center">
                        <span className="font-bebas text-3xl md:text-4xl text-[#303443]">{rankNum}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={answer.id}
                    className="perspective-1000 select-none cursor-default h-22 md:h-26 lg:h-30"
                  >
                    <div className="relative w-full h-full transition-transform duration-500 transform-style-3d">
                      {answer.revealed ? (
                        /* Revealed Face */
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-[#172033] to-[#1e2a44] border-2 md:border-3 border-[#ffb800] flex items-center justify-between px-3 md:px-4 py-2 shadow-[0_0_25px_rgba(255,184,0,0.3)] gap-2">
                          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0 pr-1">
                            <span className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-[#090e1b] text-[#ffdca1] font-mono-score font-bold flex items-center justify-center text-xs md:text-sm border border-[#ffb800]/40 shrink-0">
                              {answer.rank}
                            </span>
                            <span
                              className={`font-bebas text-[#ffffff] tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-[1.08] break-normal whitespace-normal line-clamp-2 ${getDynamicAnswerFontSize(
                                answer.text
                              )}`}
                              style={{ wordBreak: 'keep-all', overflowWrap: 'normal' }}
                              title={answer.text}
                            >
                              {answer.text}
                            </span>
                          </div>
                          <div className="font-bebas text-2xl md:text-3xl lg:text-4xl text-black bg-[#ffb800] px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-xl font-bold shadow-inner min-w-[50px] md:min-w-[65px] text-center leading-none shrink-0 ml-1">
                            {answer.points}
                          </div>
                        </div>
                      ) : (
                        /* Hidden Face */
                        <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#0a1020] border-2 md:border-3 border-[#25324d] flex items-center justify-center shadow-xl">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#090e1b] border-2 md:border-3 border-[#ffb800]/50 flex items-center justify-center shadow-inner">
                            <span className="font-bebas text-4xl md:text-5xl lg:text-6xl text-[#ffdca1] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-none">
                              {answer.rank}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column (5..8) */}
            <div className="space-y-3 md:space-y-4 flex flex-col justify-between flex-1">
              {rightSlots.map((answer, idx) => {
                const rankNum = idx + 5;
                if (!answer) {
                  return (
                    <div
                      key={`empty-${rankNum}`}
                      className="h-22 md:h-26 lg:h-30 rounded-2xl bg-[#090e1b]/40 border-2 border-[#252a38]/60 border-dashed flex items-center justify-center select-none opacity-25"
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0e1320] border border-[#252a38] flex items-center justify-center">
                        <span className="font-bebas text-3xl md:text-4xl text-[#303443]">{rankNum}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={answer.id}
                    className="perspective-1000 select-none cursor-default h-22 md:h-26 lg:h-30"
                  >
                    <div className="relative w-full h-full transition-transform duration-500 transform-style-3d">
                      {answer.revealed ? (
                        /* Revealed Face */
                        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-[#172033] to-[#1e2a44] border-2 md:border-3 border-[#ffb800] flex items-center justify-between px-3 md:px-4 py-2 shadow-[0_0_25px_rgba(255,184,0,0.3)] gap-2">
                          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0 pr-1">
                            <span className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-[#090e1b] text-[#ffdca1] font-mono-score font-bold flex items-center justify-center text-xs md:text-sm border border-[#ffb800]/40 shrink-0">
                              {answer.rank}
                            </span>
                            <span
                              className={`font-bebas text-[#ffffff] tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-[1.08] break-normal whitespace-normal line-clamp-2 ${getDynamicAnswerFontSize(
                                answer.text
                              )}`}
                              style={{ wordBreak: 'keep-all', overflowWrap: 'normal' }}
                              title={answer.text}
                            >
                              {answer.text}
                            </span>
                          </div>
                          <div className="font-bebas text-2xl md:text-3xl lg:text-4xl text-black bg-[#ffb800] px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-xl font-bold shadow-inner min-w-[50px] md:min-w-[65px] text-center leading-none shrink-0 ml-1">
                            {answer.points}
                          </div>
                        </div>
                      ) : (
                        /* Hidden Face */
                        <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#0a1020] border-2 md:border-3 border-[#25324d] flex items-center justify-center shadow-xl">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#090e1b] border-2 md:border-3 border-[#ffb800]/50 flex items-center justify-center shadow-inner">
                            <span className="font-bebas text-4xl md:text-5xl lg:text-6xl text-[#ffdca1] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-none">
                              {answer.rank}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT POD: TEAM 2 */}
        <div
          className={`lg:col-span-3 rounded-2xl p-4 md:p-6 relative overflow-hidden flex flex-col justify-between min-h-[580px] md:min-h-[640px] transition-all duration-300 ${
            isTeam2Winner
              ? 'bg-gradient-to-b from-[#352609] to-[#171b29] border-4 border-[#ffb800] shadow-[0_0_60px_rgba(255,184,0,0.8)] ring-4 ring-[#ffb800]/60'
              : isTeam2Active
              ? 'bg-[#171b29] border-2 border-[#ffb800] shadow-[0_0_35px_rgba(255,184,0,0.35)] ring-2 ring-[#ffb800]/40'
              : hasWinner
              ? 'bg-[#171b29] border border-[#252a38] opacity-50'
              : 'bg-[#171b29] border border-[#252a38] opacity-80'
          }`}
        >
          {/* Top In Control Pill */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#ffb800] uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#ffb800]" />
              <span>STAGE RIGHT</span>
            </div>
            <span className="text-[10px] font-mono-score font-bold bg-[#ffb800]/20 text-[#ffdca1] px-2 py-0.5 rounded border border-[#ffb800]/30">
              5 PLAYERS
            </span>
          </div>

          {/* HIGHLY EXPOSED IN PLAY / FINAL CALL WINNER BANNER */}
          {isTeam2Winner ? (
            <div className="mb-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ffb800] via-[#ffdca1] to-[#ffb800] text-black font-bebas text-2xl md:text-3xl tracking-widest uppercase flex items-center justify-center space-x-2 shadow-[0_0_35px_rgba(255,184,0,0.9)] animate-pulse">
              <Trophy className="w-6 h-6 text-black fill-black" />
              <span>★ FINAL CALL WINNER ★</span>
              <Trophy className="w-6 h-6 text-black fill-black" />
            </div>
          ) : isTeam2Active ? (
            <div className="mb-3 py-2 px-3 rounded-xl bg-gradient-to-r from-[#ffb800]/30 via-[#ffb800]/15 to-[#ffb800]/30 border-2 border-[#ffb800] shadow-[0_0_25px_rgba(255,184,0,0.5)] flex items-center justify-center space-x-2.5 animate-pulse">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb800] opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ffb800] shadow-[0_0_8px_#ffb800]"></span>
              </span>
              <span className="font-bebas text-2xl md:text-3xl tracking-widest uppercase font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                ★ IN PLAY ★
              </span>
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb800] opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ffb800] shadow-[0_0_8px_#ffb800]"></span>
              </span>
            </div>
          ) : (
            <div className="mb-3 py-1.5 px-3 rounded-xl bg-[#0e1320] border border-[#252a38] text-[#9e8f78] flex items-center justify-center space-x-1.5 text-xs font-mono-score font-semibold uppercase">
              <span>ON DECK / WAITING</span>
            </div>
          )}

          {/* Team Name */}
          <h2 className="font-bebas text-3xl md:text-5xl text-[#dee2f5] tracking-wide my-1 text-center">
            {team2.name}
          </h2>

          {/* Stylized Family Portrait Graphic */}
          <div className="relative w-full h-36 md:h-44 rounded-xl overflow-hidden bg-[#0e1320] border border-[#252a38] flex items-center justify-center p-3 my-2">
            {isTeam2Winner && (
              <div className="absolute top-2 right-2 z-20 w-11 h-11 rounded-full bg-[#ffb800] border-2 border-white flex items-center justify-center shadow-[0_0_25px_#ffb800] animate-bounce">
                <Trophy className="w-6 h-6 text-black fill-black" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1320] via-transparent to-[#ffb800]/20"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex -space-x-3 mb-3">
                {['S', 'K', 'C', 'L', 'B'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 md:w-13 md:h-13 rounded-full bg-gradient-to-b from-[#252a38] to-[#0e1320] border-2 border-[#ffb800] flex items-center justify-center font-bebas text-xl md:text-2xl text-[#ffb800] shadow-md"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div className="text-xs font-space text-[#ffdca1] font-semibold text-center">
                ● CAPTAIN: {team2.captain || 'SARAH'}
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className="text-center py-4 md:py-6 bg-[#0e1320] rounded-xl border border-[#303443] my-2">
            <div className="text-[11px] font-mono-score uppercase text-[#9e8f78] tracking-widest">
              TOTAL MATCH SCORE
            </div>
            <div className="font-mono-score text-6xl md:text-7xl font-bold text-[#ffb800] leading-none my-1 tracking-tight">
              {String(team2.score).padStart(3, '0')}
            </div>
            <div className="text-[11px] font-space font-semibold uppercase text-[#9e8f78] tracking-wider">
              POINTS EARNED
            </div>
          </div>

          {/* Team Strike (Single Strike) */}
          <div className="space-y-1.5 my-2">
            <div className="flex items-center justify-between text-xs font-mono-score text-[#9e8f78]">
              <span>TEAM STRIKE</span>
              <span className={team2.strikes > 0 ? 'text-[#ef4444] font-bold' : 'text-[#9e8f78]'}>
                {team2.strikes > 0 ? 'STRIKE INCURRED' : 'CLEAR'}
              </span>
            </div>
            <div
              className={`h-16 md:h-20 rounded-xl flex items-center justify-center font-bebas text-5xl md:text-6xl font-bold transition-all ${team2.strikes > 0
                ? 'bg-[#93000a] text-[#ffdad6] border-2 border-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.7)]'
                : 'bg-[#0e1320] text-[#303443] border border-[#252a38]'
                }`}
            >
              {team2.strikes > 0 ? '✕' : ''}
            </div>
          </div>

          {/* Stage Status Subtext / Prominent IN PLAY indicator */}
          <div className="pt-2.5 border-t border-[#252a38]">
            {isTeam2Winner ? (
              <div className="py-2.5 px-3 rounded-xl bg-[#ffb800] text-black border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.8)] font-bebas text-lg md:text-xl tracking-wider space-x-2">
                <Sparkles className="w-5 h-5 fill-black" />
                <span>CHAMPIONS</span>
              </div>
            ) : isTeam2Active ? (
              <div className="py-2 px-3 rounded-xl bg-[#ffb800]/20 border-2 border-[#ffb800] flex items-center justify-between shadow-[0_0_15px_rgba(255,184,0,0.3)]">
                <span className="flex items-center space-x-2 font-mono-score text-xs font-bold text-[#ffb800]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffb800] animate-ping" />
                  <span className="font-bebas text-lg md:text-xl tracking-wider text-white">IN PLAY NOW</span>
                </span>
                <span className="text-[11px] font-mono-score font-bold uppercase text-[#ffb800] bg-[#ffb800]/30 px-2 py-0.5 rounded border border-[#ffb800]/50">
                  {team2.strikes > 0 ? '1 STRIKE' : 'BOARD CONTROL'}
                </span>
              </div>
            ) : (
              <div className="py-2 px-3 rounded-xl bg-[#0e1320] border border-[#252a38] flex items-center justify-between text-[11px] font-mono-score text-[#9e8f78]">
                <span>WAITING FOR TURN</span>
                <span>STAGE RIGHT</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
