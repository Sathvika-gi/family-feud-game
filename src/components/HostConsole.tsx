import React, { useRef } from 'react';
import { useGame } from '../context/GameContext';
import { SurveyBank } from './SurveyBank';
import {
  Trophy,
  RotateCcw,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Bell,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Music,
  FolderOpen,
  Edit2,
  Tv,
  ExternalLink,
  Wifi,
  Radio,
  Sliders
} from 'lucide-react';

interface HostConsoleProps {
  onSwitchToStage?: () => void;
}

export function HostConsole({ onSwitchToStage }: HostConsoleProps) {
  const {
    gameState,
    currentQuestion,
    currentPot,
    revealedCount,
    totalAnswersCount,
    setActiveTeam,
    revealAnswer,
    hideAnswer,
    revealAllAnswers,
    hideAllAnswers,
    awardPotToTeam,
    triggerFinalCall,
    clearFinalCall,
    awardAnswerToTeam,
    adjustTeamScore,
    setTeamScore,
    updateTeamInfo,
    addStrike,
    clearStrikes,
    updateQuestionText,
    updateAnswer,
    playSfxDirect,
    isConnected,
    latency,
    gameId,
  } = useGame();

  const surveyBankRef = useRef<HTMLDivElement>(null);

  const team1 = gameState.teams[0] || { id: 'team-1', name: 'TEAM 1', score: 0, strikes: 0, color: '#FFB800' };
  const team2 = gameState.teams[1] || { id: 'team-2', name: 'TEAM 2', score: 0, strikes: 0, color: '#FFB800' };

  const totalQuestionPoints =
    currentQuestion?.answers.reduce((acc, a) => acc + a.points, 0) || 0;

  const scrollToSurveyBank = () => {
    surveyBankRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openProjectorWindow = () => {
    const url = `${window.location.origin}${window.location.pathname}?tab=stage&game=${gameId}`;
    window.open(url, '_blank');
  };

  const handleFinalCall = (teamId: string) => {
    triggerFinalCall(teamId);
  };

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 space-y-6">
      {/* DEDICATED HOST & ADMIN HEADER (Replaces Global Navbar) */}
      <div className="bg-[#000000] border-2 border-[#E2E8F0]/20 rounded-[26px] p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-[10px] bg-[#000000] border-2 border-[#FFB800]/70 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.25)] shrink-0 overflow-hidden">
            <img
              src="/campus-life-logo.png"
              alt="Campus Life Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono-score font-bold uppercase tracking-wider text-[#FFB800] bg-[#FFB800]/15 px-2.5 py-0.5 rounded-full border border-[#FFB800]/40">
                CAMPUS LIFE
              </span>
              <h1 className="font-bebas text-2xl md:text-3xl tracking-wider text-[#FFFFFF] leading-none">
                POUTPOURRI • HOST CONSOLE
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono-score font-bold bg-[#FFB800] text-black">
                OPERATOR
              </span>
            </div>
            <div className="text-xs text-[#E2E8F0]/70 font-space mt-0.5">
              BROADCAST CONTROL ROOM • LIVE STAGE SYNCHRONIZATION
            </div>
          </div>
        </div>

        {/* Action buttons & Room connectivity */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={scrollToSurveyBank}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#000000] hover:bg-[#111111] border-2 border-[#FFB800]/50 text-xs font-semibold text-[#FFB800] transition-all shadow-sm hover:border-[#FFB800]"
          >
            <FolderOpen className="w-4 h-4 text-[#FFB800]" />
            <span>Survey Bank (CSV)</span>
          </button>

          {onSwitchToStage && (
            <button
              onClick={onSwitchToStage}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#000000] hover:bg-[#111111] border-2 border-[#E2E8F0]/30 text-xs font-semibold text-[#FFFFFF] hover:border-[#FFB800] transition-all"
              title="Switch to Stage Dashboard in this window"
            >
              <Tv className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Switch to Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: TEAM SETUP & TURN SELECTION */}
      <section className="bg-[#000000] border-2 border-[#E2E8F0]/20 rounded-[26px] p-5 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]/15">
          <div className="flex items-center space-x-2">
            <span className="font-bebas text-lg md:text-xl text-[#FFFFFF] tracking-wider">
              1. TEAM SETUP & TURN SELECTION
            </span>
            <span className="text-xs text-[#E2E8F0]/70 uppercase font-mono-score">
              (LIVE GAME CONFIGURATION)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Team 1 Card */}
          <div
            className={`p-4 rounded-[10px] border-2 transition-all ${gameState.currentTeamId === team1.id
              ? 'bg-[#000000] border-[#FFB800] shadow-[0_0_20px_rgba(255,184,0,0.25)]'
              : 'bg-[#000000] border-[#E2E8F0]/20'
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
                <span className="font-bebas text-base text-[#FFFFFF] tracking-wider">
                  TEAM 1 • STAGE LEFT
                </span>
              </div>
              {gameState.currentTeamId === team1.id ? (
                <div className="px-3 py-1 rounded-full bg-[#FFB800] text-black font-bold text-xs uppercase tracking-wider">
                  ACTIVE TURN / IN CONTROL
                </div>
              ) : (
                <button
                  onClick={() => setActiveTeam(team1.id)}
                  className="px-3 py-1 rounded-full bg-[#000000] hover:bg-[#111111] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider border border-[#E2E8F0]/30 hover:border-[#FFB800]"
                >
                  SET AS ACTIVE TURN
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-[#E2E8F0]/70 mb-1">
                  TEAM NAME
                </label>
                <input
                  type="text"
                  value={team1.name}
                  onChange={(e) => updateTeamInfo(team1.id, { name: e.target.value })}
                  className="w-full bg-[#000000] border border-[#E2E8F0]/25 rounded-[10px] px-3 py-2 font-bold text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFB800]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase font-bold text-[#E2E8F0]/70">
                    POINTS / SCORE
                  </label>
                  <button
                    onClick={() => setTeamScore(team1.id, 0)}
                    className="text-[10px] text-[#E2E8F0]/70 hover:text-[#FFB800] flex items-center space-x-1 font-mono-score transition-colors"
                    title="Reset points to 0"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>RESET</span>
                  </button>
                </div>
                <div className="flex items-center bg-[#000000] border border-[#E2E8F0]/25 rounded-[10px] overflow-hidden">
                  <input
                    type="number"
                    value={team1.score}
                    onChange={(e) => setTeamScore(team1.id, parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent px-2 py-2 font-mono-score font-bold text-sm text-[#FFB800] text-center focus:outline-none"
                  />
                  {/* Reset points button */}
                  <button
                    onClick={() => setTeamScore(team1.id, 0)}
                    className="p-2 border-l border-[#E2E8F0]/20 text-[#E2E8F0]/70 hover:text-[#FFB800] hover:bg-[#111111] transition-colors"
                    title="Reset points to 0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex flex-col border-l border-[#E2E8F0]/20">
                    <button
                      onClick={() => adjustTeamScore(team1.id, 1)}
                      className="px-1.5 text-[#E2E8F0]/70 hover:text-white text-[10px]"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => adjustTeamScore(team1.id, -1)}
                      className="px-1.5 text-[#E2E8F0]/70 hover:text-white text-[10px]"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#E2E8F0]/70 mb-1">
                CAPTAIN & MEMBERS (ROSTER)
              </label>
              <input
                type="text"
                value={team1.members}
                onChange={(e) => updateTeamInfo(team1.id, { members: e.target.value })}
                className="w-full bg-[#000000] border border-[#E2E8F0]/25 rounded-[10px] px-3 py-1.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#FFB800]"
              />
            </div>
          </div>

          {/* Team 2 Card */}
          <div
            className={`p-4 rounded-[10px] border-2 transition-all ${gameState.currentTeamId === team2.id
              ? 'bg-[#000000] border-[#FFB800] shadow-[0_0_20px_rgba(255,184,0,0.2)]'
              : 'bg-[#000000] border-[#E2E8F0]/20'
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
                <span className="font-bebas text-base text-[#FFB800] tracking-wider">
                  TEAM 2 • STAGE RIGHT
                </span>
              </div>
              {gameState.currentTeamId === team2.id ? (
                <div className="px-3 py-1 rounded-full bg-[#FFB800] text-black font-bold text-xs uppercase tracking-wider">
                  ACTIVE TURN / IN CONTROL
                </div>
              ) : (
                <button
                  onClick={() => setActiveTeam(team2.id)}
                  className="px-3 py-1 rounded-full bg-[#000000] hover:bg-[#111625] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider border border-[#E2E8F0]/30 hover:border-[#FFB800]"
                >
                  SET AS ACTIVE TURN
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-[#94A3B8] mb-1">
                  TEAM NAME
                </label>
                <input
                  type="text"
                  value={team2.name}
                  onChange={(e) => updateTeamInfo(team2.id, { name: e.target.value })}
                  className="w-full bg-[#000000] border border-[#E2E8F0]/25 rounded-[10px] px-3 py-2 font-bold text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFB800]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase font-bold text-[#94A3B8]">
                    POINTS / SCORE
                  </label>
                  <button
                    onClick={() => setTeamScore(team2.id, 0)}
                    className="text-[10px] text-[#94A3B8] hover:text-[#FFB800] flex items-center space-x-1 font-mono-score transition-colors"
                    title="Reset points to 0"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>RESET</span>
                  </button>
                </div>
                <div className="flex items-center bg-[#000000] border border-[#E2E8F0]/25 rounded-[10px] overflow-hidden">
                  <input
                    type="number"
                    value={team2.score}
                    onChange={(e) => setTeamScore(team2.id, parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent px-2 py-2 font-mono-score font-bold text-sm text-[#FFB800] text-center focus:outline-none"
                  />
                  {/* Reset points button */}
                  <button
                    onClick={() => setTeamScore(team2.id, 0)}
                    className="p-2 border-l border-[#E2E8F0]/20 text-[#94A3B8] hover:text-[#FFB800] hover:bg-[#111625] transition-colors"
                    title="Reset points to 0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex flex-col border-l border-[#E2E8F0]/20">
                    <button
                      onClick={() => adjustTeamScore(team2.id, 1)}
                      className="px-1.5 text-[#94A3B8] hover:text-white text-[10px]"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => adjustTeamScore(team2.id, -1)}
                      className="px-1.5 text-[#94A3B8] hover:text-white text-[10px]"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#94A3B8] mb-1">
                CAPTAIN & MEMBERS (ROSTER)
              </label>
              <input
                type="text"
                value={team2.members}
                onChange={(e) => updateTeamInfo(team2.id, { members: e.target.value })}
                className="w-full bg-[#000000] border border-[#E2E8F0]/25 rounded-[10px] px-3 py-1.5 text-xs text-[#E2E8F0] focus:outline-none focus:border-[#FFB800]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STRIKE CONTROLS AND SFX */}
      <section className="bg-[#000000] border-2 border-[#E2E8F0]/20 rounded-[26px] p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]/15">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-[#FFB800]" />
            <h2 className="font-bebas text-xl md:text-2xl text-[#FFFFFF] tracking-wider leading-none">
              STRIKE CONTROLS AND SFX
            </h2>
          </div>
          <div className="text-xs font-mono-score text-[#FFB800] bg-[#000000] px-3.5 py-1 rounded-full border border-[#FFB800]/40">
            CURRENT ROUND POT: <strong className="text-white font-bold">{currentPot} PTS</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Final Call - Trigger Winner (2 buttons) */}
          <div className="bg-[#000000] p-4 rounded-[10px] border border-[#E2E8F0]/25 space-y-2.5">
            <div className="text-[11px] font-mono-score font-bold uppercase text-[#FFB800] tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>FINAL CALL</span>
              </span>
              {gameState.winnerTeamId && (
                <button
                  onClick={clearFinalCall}
                  className="text-[10px] text-[#ef4444] hover:underline font-bold uppercase"
                >
                  Clear Winner
                </button>
              )}
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleFinalCall(team1.id)}
                className={`w-full py-3 px-3 rounded-[10px] bg-[#000000] hover:bg-[#FFB800] hover:text-black text-[#FFB800] border-2 border-[#FFB800] font-bebas text-base md:text-lg tracking-wide flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95 font-bold ${gameState.winnerTeamId === team1.id ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,184,0,0.8)]' : ''
                  }`}
                title={`Trigger ${team1.name} as Final Winner on stage`}
              >
                <Trophy className="w-4 h-4" />
                <span>FINAL CALL: {team1.name}</span>
              </button>
              <button
                onClick={() => handleFinalCall(team2.id)}
                className={`w-full py-3 px-3 rounded-[10px] bg-[#FFB800] hover:bg-[#FFC633] text-black font-bebas text-base md:text-lg tracking-wide flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95 font-bold ${gameState.winnerTeamId === team2.id ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,184,0,0.8)]' : ''
                  }`}
                title={`Trigger ${team2.name} as Final Winner on stage`}
              >
                <Trophy className="w-4 h-4 text-black" />
                <span>FINAL CALL: {team2.name}</span>
              </button>
            </div>
          </div>

          {/* 2. Team 1 and 2 Strike Buttons (2 buttons) */}
          <div className="bg-[#000000] p-4 rounded-[10px] border border-[#E2E8F0]/25 space-y-2.5">
            <div className="text-[11px] font-mono-score font-bold uppercase text-[#ffdad6] tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>TEAM STRIKES (SINGLE STRIKE)</span>
              </span>
              {(team1.strikes > 0 || team2.strikes > 0) && (
                <button
                  onClick={() => {
                    clearStrikes(team1.id);
                    clearStrikes(team2.id);
                  }}
                  className="text-[10px] text-[#E2E8F0]/70 hover:text-[#FFFFFF] underline uppercase"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addStrike(team1.id)}
                  className={`flex-1 py-3 px-3 rounded-[10px] font-bebas text-base tracking-wide flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-95 font-bold ${team1.strikes > 0
                    ? 'bg-[#93000a] text-[#ffdad6] border-2 border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                    : 'bg-[#93000a]/30 hover:bg-[#93000a] text-[#ffdad6] border border-[#ef4444]/50'
                    }`}
                >
                  <XCircle className="w-4 h-4 text-[#ef4444]" />
                  <span>STRIKE {team1.name}</span>
                </button>
                {team1.strikes > 0 && (
                  <button
                    onClick={() => clearStrikes(team1.id)}
                    className="p-3 rounded-[10px] bg-[#000000] hover:bg-[#111111] text-[#FFFFFF] border border-[#E2E8F0]/30"
                    title="Clear Team 1 Strike"
                  >
                    <RotateCcw className="w-4 h-4 text-[#FFB800]" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addStrike(team2.id)}
                  className={`flex-1 py-3 px-3 rounded-[10px] font-bebas text-base tracking-wide flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-95 font-bold ${team2.strikes > 0
                    ? 'bg-[#93000a] text-[#ffdad6] border-2 border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                    : 'bg-[#93000a]/30 hover:bg-[#93000a] text-[#ffdad6] border border-[#ef4444]/50'
                    }`}
                >
                  <XCircle className="w-4 h-4 text-[#ef4444]" />
                  <span>STRIKE {team2.name}</span>
                </button>
                {team2.strikes > 0 && (
                  <button
                    onClick={() => clearStrikes(team2.id)}
                    className="p-3 rounded-[10px] bg-[#000000] hover:bg-[#111111] text-[#FFFFFF] border border-[#E2E8F0]/30"
                    title="Clear Team 2 Strike"
                  >
                    <RotateCcw className="w-4 h-4 text-[#FFB800]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Correct and Wrong (2 buttons) */}
          <div className="bg-[#000000] p-4 rounded-[10px] border border-[#E2E8F0]/25 space-y-2.5">
            <div className="text-[11px] font-mono-score font-bold uppercase text-[#FFB800] tracking-wider flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>SFX TRIGGERS</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => playSfxDirect('ding')}
                className="w-full py-3 px-3 rounded-[10px] bg-[#000000] hover:bg-[#FFB800]/15 text-[#FFB800] font-bebas text-base tracking-wide flex items-center justify-center space-x-2 border-2 border-[#FFB800] shadow-md transition-all active:scale-95 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
                <span>CORRECT (DING)</span>
              </button>
              <button
                onClick={() => playSfxDirect('buzz')}
                className="w-full py-3 px-3 rounded-[10px] bg-[#93000a]/30 hover:bg-[#93000a]/60 text-[#ffb4ab] font-bebas text-base tracking-wide flex items-center justify-center space-x-2 border-2 border-[#ef4444]/50 shadow-md transition-all active:scale-95 font-bold"
              >
                <XCircle className="w-4 h-4 text-[#ef4444]" />
                <span>WRONG (BUZZ & SCREEN X)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ACTIVE SURVEY QUESTION & ANSWERS EDITOR */}
      <section className="bg-[#000000] border-2 border-[#E2E8F0]/20 rounded-[26px] p-5 md:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E2E8F0]/15">
          <div className="flex items-center space-x-2">
            <span className="font-bebas text-lg md:text-xl text-[#FFFFFF] tracking-wider">
              2. ACTIVE SURVEY QUESTION & ANSWERS CONTROLLER
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-mono-score">
              <span className="text-[#94A3B8] uppercase">TOTAL QUESTION POINTS:</span>
              <span className="text-[#FFB800] font-bold text-sm">{totalQuestionPoints} PTS</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={revealAllAnswers}
                className="px-4 py-1.5 rounded-[10px] bg-[#FFB800] hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider transition-all"
              >
                REVEAL ALL
              </button>
              <button
                onClick={hideAllAnswers}
                className="px-4 py-1.5 rounded-[10px] bg-[#000000] hover:bg-[#111625] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider border border-[#E2E8F0]/30 transition-all"
              >
                HIDE ALL / RESET
              </button>
            </div>
          </div>
        </div>

        {/* Active Stage Question Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase text-[#94A3B8] tracking-wider">
              ACTIVE STAGE SURVEY QUESTION
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono-score text-[#E2E8F0]">
                SURVEY ID: {currentQuestion?.surveyId || '#482'} • {totalAnswersCount} ANSWERS TOTAL
              </span>
              <button
                onClick={scrollToSurveyBank}
                className="flex items-center space-x-1 text-xs text-[#FFB800] hover:underline font-semibold"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>Jump to Survey Bank ↓</span>
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={currentQuestion?.text || ''}
              onChange={(e) => updateQuestionText(e.target.value)}
              className="w-full bg-[#000000] border-2 border-[#FFB800]/50 rounded-[10px] px-4 py-3 font-bebas text-lg md:text-xl text-[#FFFFFF] tracking-wide focus:outline-none focus:border-[#FFB800] shadow-inner"
            />
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-2">
          {currentQuestion?.answers.map((answer) => (
            <div
              key={answer.id}
              className={`p-3 rounded-[10px] border flex flex-wrap items-center justify-between gap-2 transition-all ${answer.revealed
                ? 'bg-[#000000] border-[#FFB800] shadow-[0_0_15px_rgba(255,184,0,0.15)]'
                : 'bg-[#000000] border-[#E2E8F0]/20'
                }`}
            >
              {/* Rank & Text */}
              <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
                <span className="w-7 h-7 rounded-[3px] bg-[#000000] text-[#FFB800] font-mono-score font-bold flex items-center justify-center text-xs border border-[#FFB800]/40">
                  {answer.rank}
                </span>
                <input
                  type="text"
                  value={answer.text}
                  onChange={(e) => updateAnswer(answer.id, { text: e.target.value })}
                  className="bg-transparent font-bebas text-base md:text-lg text-[#FFFFFF] tracking-wide focus:outline-none focus:border-b focus:border-[#FFB800] flex-1"
                />
              </div>

              {/* Points input with Reset icon */}
              <div className="flex items-center bg-[#000000] border border-[#E2E8F0]/30 rounded-[10px] px-2 py-1 space-x-1">
                <input
                  type="number"
                  value={answer.points}
                  onChange={(e) => updateAnswer(answer.id, { points: parseInt(e.target.value) || 0 })}
                  className="w-10 bg-transparent text-center font-mono-score font-bold text-xs text-[#FFB800] focus:outline-none"
                />
                <span className="text-[10px] text-[#94A3B8] uppercase">pts</span>
                <button
                  onClick={() => updateAnswer(answer.id, { points: 0 })}
                  className="text-[#94A3B8] hover:text-[#FFB800] p-0.5 transition-colors"
                  title="Reset answer points to 0"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono-score font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${answer.revealed
                  ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/50'
                  : 'bg-[#000000] text-[#94A3B8] border border-[#E2E8F0]/20'
                  }`}
              >
                {answer.revealed ? 'REVEALED' : 'HIDDEN'}
              </span>

              {/* Quick Point Awards to Teams (Elongated Full Team Names) */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => awardAnswerToTeam(answer.id, team1.id)}
                  className="px-3.5 py-1.5 min-w-[120px] rounded-[10px] bg-[#000000] hover:bg-[#111111] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider border border-[#E2E8F0]/30 hover:border-[#FFB800] transition-all flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                  title={`Award ${answer.points * gameState.roundMultiplier} pts to ${team1.name}`}
                >
                  <span className="text-[#FFB800] font-extrabold">+</span>
                  <span className="truncate max-w-[150px]">{team1.name}</span>
                </button>
                <button
                  onClick={() => awardAnswerToTeam(answer.id, team2.id)}
                  className="px-3.5 py-1.5 min-w-[120px] rounded-[10px] bg-[#000000] hover:bg-[#111111] text-[#FFB800] text-xs font-bold uppercase tracking-wider border border-[#FFB800]/50 hover:bg-[#FFB800]/10 transition-all flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                  title={`Award ${answer.points * gameState.roundMultiplier} pts to ${team2.name}`}
                >
                  <span className="text-[#FFB800] font-extrabold">+</span>
                  <span className="truncate max-w-[150px]">{team2.name}</span>
                </button>
              </div>

              {/* Toggle Reveal Button */}
              <button
                onClick={() => (answer.revealed ? hideAnswer(answer.id) : revealAnswer(answer.id))}
                className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all ${answer.revealed
                  ? 'bg-[#000000] hover:bg-[#111625] text-[#FFFFFF] border border-[#E2E8F0]/30'
                  : 'bg-[#FFB800] hover:brightness-110 text-black shadow-md'
                  }`}
              >
                {answer.revealed ? 'Hide' : 'Reveal'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: SURVEY BANK & CSV INGESTION (Directly inside Host Console route) */}
      <div ref={surveyBankRef}>
        <SurveyBank />
      </div>

    </div>
  );
}
