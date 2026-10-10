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

function DebouncedInput({ value, onChange, className, type = "text", placeholder = "" }: { value: string | number, onChange: (val: string) => void, className?: string, type?: string, placeholder?: string }) {
  const [localVal, setLocalVal] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) setLocalVal(value);
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (localVal !== value) onChange(localVal.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  };

  return (
    <input
      type={type}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
    />
  );
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

  const team1 = gameState.teams[0] || { id: 'team-1', name: 'TEAM 1', score: 0, strikes: 0, color: '#00e3fd', captain: '', members: '' };
  const team2 = gameState.teams[1] || { id: 'team-2', name: 'TEAM 2', score: 0, strikes: 0, color: '#ffb800', captain: '', members: '' };

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
      <div className="bg-[#090e1b] border border-[#252a38] rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0e1320] border-2 border-[#ffb800]/60 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(255,184,0,0.25)] shrink-0 overflow-hidden">
            <img
              src="/campus-life-logo.png"
              alt="Campus Life Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono-score font-bold uppercase tracking-wider text-[#00e3fd] bg-[#00e3fd]/15 px-2 py-0.5 rounded border border-[#00e3fd]/30">
                CAMPUS LIFE
              </span>
              <h1 className="font-bebas text-2xl md:text-3xl tracking-wider text-[#ffdca1] leading-none">
                POUTPOURRI • HOST CONSOLE
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-score font-bold bg-[#ffb800]/20 text-[#ffdca1] border border-[#ffb800]/40">
                OPERATOR
              </span>
            </div>
            <div className="text-xs text-[#9e8f78] font-space mt-0.5">
              BROADCAST CONTROL ROOM • LIVE STAGE SYNCHRONIZATION
            </div>
          </div>
        </div>

        {/* Action buttons & Room connectivity */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={scrollToSurveyBank}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#171b29] hover:bg-[#252a38] border border-[#ffb800]/40 text-xs font-semibold text-[#ffdca1] transition-all shadow-sm"
          >
            <FolderOpen className="w-4 h-4 text-[#ffb800]" />
            <span>Survey Bank (CSV)</span>
          </button>


          {onSwitchToStage && (
            <button
              onClick={onSwitchToStage}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#252a38] hover:bg-[#343948] border border-[#514532] text-xs font-semibold text-[#dee2f5] transition-all"
              title="Switch to Stage Dashboard in this window"
            >
              <Tv className="w-3.5 h-3.5 text-[#00e3fd]" />
              <span>Switch to Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: TEAM SETUP & TURN SELECTION */}
      <section className="bg-[#171b29] border border-[#252a38] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#252a38]">
          <div className="flex items-center space-x-2">
            <span className="font-bebas text-lg text-[#ffdca1] tracking-wider">
              1. TEAM SETUP & TURN SELECTION
            </span>
            <span className="text-xs text-[#9e8f78] uppercase font-mono-score">
              (LIVE GAME CONFIGURATION)
            </span>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Team 1 Card */}
          <div
            className={`p-4 rounded-lg border transition-all ${gameState.currentTeamId === team1.id
              ? 'bg-[#1b1f2d] border-[#00e3fd] shadow-[0_0_15px_rgba(0,227,253,0.15)]'
              : 'bg-[#1b1f2d]/60 border-[#303443]'
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e3fd]"></span>
                <span className="font-bebas text-base text-[#bdf4ff] tracking-wider">
                  TEAM 1 • STAGE LEFT
                </span>
              </div>
              {gameState.currentTeamId === team1.id ? (
                <div className="px-2.5 py-0.5 rounded bg-[#00e3fd] text-black font-bold text-xs uppercase tracking-wider">
                  ACTIVE TURN / IN CONTROL
                </div>
              ) : (
                <button
                  onClick={() => setActiveTeam(team1.id)}
                  className="px-2.5 py-0.5 rounded bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] text-xs font-semibold uppercase tracking-wider border border-[#514532]"
                >
                  SET AS ACTIVE TURN
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-[#9e8f78] mb-1">
                  TEAM NAME
                </label>
                <input
                  type="text"
                  value={team1.name}
                  onChange={(e) => updateTeamInfo(team1.id, { name: e.target.value })}
                  className="w-full bg-[#0e1320] border border-[#303443] rounded px-3 py-1.5 font-bold text-sm text-[#dee2f5] focus:outline-none focus:border-[#00e3fd]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase font-bold text-[#9e8f78]">
                    POINTS / SCORE
                  </label>
                  <button
                    onClick={() => setTeamScore(team1.id, 0)}
                    className="text-[10px] text-[#9e8f78] hover:text-[#00e3fd] flex items-center space-x-1 font-mono-score transition-colors"
                    title="Reset points to 0"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>RESET</span>
                  </button>
                </div>
                <div className="flex items-center bg-[#0e1320] border border-[#303443] rounded overflow-hidden">
                  <DebouncedInput
                    type="number"
                    value={team1.score}
                    onChange={(val) => setTeamScore(team1.id, parseInt(val) || 0)}
                    className="w-full bg-transparent px-2 py-1.5 font-mono-score font-bold text-sm text-[#00e3fd] text-center focus:outline-none"
                  />
                  {/* Reset points button */}
                  <button
                    onClick={() => setTeamScore(team1.id, 0)}
                    className="p-1.5 border-l border-[#303443] text-[#9e8f78] hover:text-[#00e3fd] hover:bg-[#252a38] transition-colors"
                    title="Reset points to 0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex flex-col border-l border-[#303443]">
                    <button
                      onClick={() => adjustTeamScore(team1.id, 1)}
                      className="px-1 text-[#9e8f78] hover:text-white text-[10px]"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => adjustTeamScore(team1.id, -1)}
                      className="px-1 text-[#9e8f78] hover:text-white text-[10px]"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#9e8f78] mb-1">
                MEMBERS (OPTIONAL)
              </label>
              <DebouncedInput
                type="text"
                placeholder="e.g. Alice, Bob, Charlie"
                value={team1.members || ''}
                onChange={(val) => updateTeamInfo(team1.id, { members: val })}
                className="w-full bg-[#0e1320] border border-[#303443] rounded px-3 py-1 text-xs text-[#d5c4ab] focus:outline-none focus:border-[#00e3fd]"
              />
            </div>
          </div>

          {/* Team 2 Card */}
          <div
            className={`p-4 rounded-lg border transition-all ${gameState.currentTeamId === team2.id
              ? 'bg-[#1b1f2d] border-[#ffb800] shadow-[0_0_15px_rgba(255,184,0,0.15)]'
              : 'bg-[#1b1f2d]/60 border-[#303443]'
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffb0b3]"></span>
                <span className="font-bebas text-base text-[#ffd7d8] tracking-wider">
                  TEAM 2 • STAGE RIGHT
                </span>
              </div>
              {gameState.currentTeamId === team2.id ? (
                <div className="px-2.5 py-0.5 rounded bg-[#ffb800] text-black font-bold text-xs uppercase tracking-wider">
                  ACTIVE TURN / IN CONTROL
                </div>
              ) : (
                <button
                  onClick={() => setActiveTeam(team2.id)}
                  className="px-2.5 py-0.5 rounded bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] text-xs font-semibold uppercase tracking-wider border border-[#514532]"
                >
                  SET AS ACTIVE TURN
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-[#9e8f78] mb-1">
                  TEAM NAME
                </label>
                <DebouncedInput
                  type="text"
                  value={team2.name}
                  onChange={(val) => updateTeamInfo(team2.id, { name: val })}
                  className="w-full bg-[#0e1320] border border-[#303443] rounded px-3 py-1.5 font-bold text-sm text-[#dee2f5] focus:outline-none focus:border-[#ffb800]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase font-bold text-[#9e8f78]">
                    POINTS / SCORE
                  </label>
                  <button
                    onClick={() => setTeamScore(team2.id, 0)}
                    className="text-[10px] text-[#9e8f78] hover:text-[#ffb800] flex items-center space-x-1 font-mono-score transition-colors"
                    title="Reset points to 0"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>RESET</span>
                  </button>
                </div>
                <div className="flex items-center bg-[#0e1320] border border-[#303443] rounded overflow-hidden">
                  <DebouncedInput
                    type="number"
                    value={team2.score}
                    onChange={(val) => setTeamScore(team2.id, parseInt(val) || 0)}
                    className="w-full bg-transparent px-2 py-1.5 font-mono-score font-bold text-sm text-[#ffb0b3] text-center focus:outline-none"
                  />
                  {/* Reset points button */}
                  <button
                    onClick={() => setTeamScore(team2.id, 0)}
                    className="p-1.5 border-l border-[#303443] text-[#9e8f78] hover:text-[#ffb800] hover:bg-[#252a38] transition-colors"
                    title="Reset points to 0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex flex-col border-l border-[#303443]">
                    <button
                      onClick={() => adjustTeamScore(team2.id, 1)}
                      className="px-1 text-[#9e8f78] hover:text-white text-[10px]"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => adjustTeamScore(team2.id, -1)}
                      className="px-1 text-[#9e8f78] hover:text-white text-[10px]"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#9e8f78] mb-1">
                MEMBERS (OPTIONAL)
              </label>
              <DebouncedInput
                type="text"
                placeholder="e.g. Alice, Bob, Charlie"
                value={team2.members || ''}
                onChange={(val) => updateTeamInfo(team2.id, { members: val })}
                className="w-full bg-[#0e1320] border border-[#303443] rounded px-3 py-1 text-xs text-[#d5c4ab] focus:outline-none focus:border-[#ffb800]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STRIKE CONTROLS AND SFX */}
      <section className="bg-[#171b29] border border-[#252a38] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#252a38]">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-[#ffb800]" />
            <h2 className="font-bebas text-xl md:text-2xl text-[#ffdca1] tracking-wider leading-none">
              STRIKE CONTROLS AND SFX
            </h2>
          </div>
          <div className="text-xs font-mono-score text-[#00e3fd] bg-[#0e1320] px-3 py-1 rounded-lg border border-[#303443]">
            CURRENT ROUND POT: <strong className="text-white font-bold">{currentPot} PTS</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Final Call - Trigger Winner (2 buttons) */}
          <div className="bg-[#0e1320] p-4 rounded-xl border border-[#303443] space-y-2.5">
            <div className="text-[11px] font-mono-score font-bold uppercase text-[#ffdca1] tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#ffb800]" />
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
                disabled={team1.score < team2.score}
                className={`w-full py-2.5 px-3 rounded-lg font-bebas text-base md:text-lg tracking-wide flex items-center justify-center space-x-2 transition-all ${team1.score >= team2.score
                    ? 'bg-[#00e3fd] hover:bg-[#9cf0ff] text-black shadow-md active:scale-95'
                    : 'bg-[#00e3fd]/10 text-[#00e3fd]/30 border border-[#00e3fd]/20 cursor-not-allowed'
                  } ${gameState.winnerTeamId === team1.id ? 'ring-2 ring-white shadow-[0_0_20px_rgba(0,227,253,0.8)]' : ''}`}
                title={team1.score >= team2.score ? `Trigger ${team1.name} as Final Winner on stage` : `Cannot select: ${team1.name} is losing on points`}
              >
                <Trophy className={`w-4 h-4 ${team1.score >= team2.score ? 'text-black' : 'text-[#00e3fd]/30'}`} />
                <span>FINAL CALL: {team1.name}</span>
              </button>
              <button
                onClick={() => handleFinalCall(team2.id)}
                disabled={team2.score < team1.score}
                className={`w-full py-2.5 px-3 rounded-lg font-bebas text-base md:text-lg tracking-wide flex items-center justify-center space-x-2 transition-all ${team2.score >= team1.score
                    ? 'bg-[#ffb800] hover:bg-[#ffc633] text-black shadow-md active:scale-95'
                    : 'bg-[#ffb800]/10 text-[#ffb800]/30 border border-[#ffb800]/20 cursor-not-allowed'
                  } ${gameState.winnerTeamId === team2.id ? 'ring-2 ring-white shadow-[0_0_20px_rgba(255,184,0,0.8)]' : ''}`}
                title={team2.score >= team1.score ? `Trigger ${team2.name} as Final Winner on stage` : `Cannot select: ${team2.name} is losing on points`}
              >
                <Trophy className={`w-4 h-4 ${team2.score >= team1.score ? 'text-black' : 'text-[#ffb800]/30'}`} />
                <span>FINAL CALL: {team2.name}</span>
              </button>
            </div>
          </div>

          {/* 2. Team 1 and 2 Strike Buttons (2 buttons) */}
          <div className="bg-[#0e1320] p-4 rounded-xl border border-[#303443] space-y-2.5">
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
                  className="text-[10px] text-[#9e8f78] hover:text-[#ffdca1] underline uppercase"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addStrike(team1.id)}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-bebas text-base tracking-wide flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-95 ${team1.strikes > 0
                    ? 'bg-[#93000a] text-[#ffdad6] border-2 border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                    : 'bg-[#93000a]/40 hover:bg-[#93000a] text-[#ffdad6] border border-[#ef4444]/60'
                    }`}
                >
                  <XCircle className="w-4 h-4 text-[#ef4444]" />
                  <span>STRIKE {team1.name}</span>
                </button>
                {team1.strikes > 0 && (
                  <button
                    onClick={() => clearStrikes(team1.id)}
                    className="p-2.5 rounded-lg bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] border border-[#514532]"
                    title="Clear Team 1 Strike"
                  >
                    <RotateCcw className="w-4 h-4 text-[#ffb800]" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addStrike(team2.id)}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-bebas text-base tracking-wide flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-95 ${team2.strikes > 0
                    ? 'bg-[#93000a] text-[#ffdad6] border-2 border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                    : 'bg-[#93000a]/40 hover:bg-[#93000a] text-[#ffdad6] border border-[#ef4444]/60'
                    }`}
                >
                  <XCircle className="w-4 h-4 text-[#ef4444]" />
                  <span>STRIKE {team2.name}</span>
                </button>
                {team2.strikes > 0 && (
                  <button
                    onClick={() => clearStrikes(team2.id)}
                    className="p-2.5 rounded-lg bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] border border-[#514532]"
                    title="Clear Team 2 Strike"
                  >
                    <RotateCcw className="w-4 h-4 text-[#ffb800]" />
                  </button>
                )}
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* SECTION 2: ACTIVE SURVEY QUESTION & ANSWERS EDITOR */}
      <section className="bg-[#171b29] border border-[#252a38] rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#252a38]">
          <div className="flex items-center space-x-2">
            <span className="font-bebas text-lg text-[#ffdca1] tracking-wider">
              2. ACTIVE SURVEY QUESTION & ANSWERS CONTROLLER
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-mono-score">
              <span className="text-[#9e8f78] uppercase">TOTAL QUESTION POINTS:</span>
              <span className="text-[#ffb800] font-bold text-sm">{totalQuestionPoints} PTS</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={revealAllAnswers}
                className="px-3 py-1 rounded bg-[#ffb800] hover:bg-[#ffc633] text-black text-xs font-bold uppercase tracking-wider transition-colors"
              >
                REVEAL ALL
              </button>
              <button
                onClick={hideAllAnswers}
                className="px-3 py-1 rounded bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] text-xs font-semibold uppercase tracking-wider border border-[#514532] transition-colors"
              >
                HIDE ALL / RESET
              </button>
            </div>
          </div>
        </div>

        {/* Active Stage Question Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase text-[#9e8f78] tracking-wider">
              ACTIVE STAGE SURVEY QUESTION
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono-score text-[#d5c4ab]">
                SURVEY ID: {currentQuestion?.surveyId || '#482'} • {totalAnswersCount} ANSWERS TOTAL
              </span>
              <button
                onClick={scrollToSurveyBank}
                className="flex items-center space-x-1 text-xs text-[#00e3fd] hover:text-[#bdf4ff] font-semibold underline"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Jump to Survey Bank ↓</span>
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={currentQuestion?.text || ''}
              onChange={(e) => updateQuestionText(e.target.value)}
              className="w-full bg-[#0e1320] border border-[#ffb800]/40 rounded-lg px-4 py-2.5 font-bebas text-lg md:text-xl text-[#ffdca1] tracking-wide focus:outline-none focus:border-[#ffb800] shadow-inner"
            />
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-2">
          {currentQuestion?.answers.map((answer) => (
            <div
              key={answer.id}
              className={`p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 transition-all ${answer.revealed
                ? 'bg-[#1b1f2d] border-[#ffb800]/60 shadow-[0_0_10px_rgba(255,184,0,0.1)]'
                : 'bg-[#0e1320]/80 border-[#252a38]'
                }`}
            >
              {/* Rank & Text */}
              <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
                <span className="w-7 h-7 rounded bg-[#252a38] text-[#ffdca1] font-mono-score font-bold flex items-center justify-center text-xs">
                  {answer.rank}
                </span>
                <input
                  type="text"
                  value={answer.text}
                  onChange={(e) => updateAnswer(answer.id, { text: e.target.value })}
                  className="bg-transparent font-bebas text-base md:text-lg text-[#dee2f5] tracking-wide focus:outline-none focus:border-b focus:border-[#ffb800] flex-1"
                />
              </div>

              {/* Points input with Reset icon */}
              <div className="flex items-center bg-[#171b29] border border-[#303443] rounded px-2 py-0.5 space-x-1">
                <input
                  type="number"
                  value={answer.points}
                  onChange={(e) => updateAnswer(answer.id, { points: parseInt(e.target.value) || 0 })}
                  className="w-10 bg-transparent text-center font-mono-score font-bold text-xs text-[#ffb800] focus:outline-none"
                />
                <span className="text-[10px] text-[#9e8f78] uppercase">pts</span>
                <button
                  onClick={() => updateAnswer(answer.id, { points: 0 })}
                  className="text-[#9e8f78] hover:text-[#ffb800] p-0.5 transition-colors"
                  title="Reset answer points to 0"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono-score font-bold px-2 py-0.5 rounded uppercase tracking-wider ${answer.revealed
                  ? 'bg-[#ffb800]/20 text-[#ffb800] border border-[#ffb800]/40'
                  : 'bg-[#252a38] text-[#9e8f78]'
                  }`}
              >
                {answer.revealed ? 'REVEALED' : 'HIDDEN'}
              </span>

              {/* Quick Point Awards to Teams (Elongated Full Team Names) */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => awardAnswerToTeam(answer.id, team1.id)}
                  className="px-3.5 py-1.5 min-w-[120px] rounded-lg bg-[#00e3fd]/15 hover:bg-[#00e3fd]/30 text-[#00e3fd] text-xs font-bold uppercase tracking-wider border border-[#00e3fd]/50 transition-all flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                  title={`Award ${answer.points} pts to ${team1.name}`}
                >
                  <span className="text-[#00e3fd] font-extrabold">+</span>
                  <span className="truncate max-w-[150px]">{team1.name}</span>
                </button>
                <button
                  onClick={() => awardAnswerToTeam(answer.id, team2.id)}
                  className="px-3.5 py-1.5 min-w-[120px] rounded-lg bg-[#ffb800]/15 hover:bg-[#ffb800]/30 text-[#ffdca1] text-xs font-bold uppercase tracking-wider border border-[#ffb800]/50 transition-all flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                  title={`Award ${answer.points} pts to ${team2.name}`}
                >
                  <span className="text-[#ffb800] font-extrabold">+</span>
                  <span className="truncate max-w-[150px]">{team2.name}</span>
                </button>
              </div>

              {/* Toggle Reveal Button */}
              <button
                onClick={() => (answer.revealed ? hideAnswer(answer.id) : revealAnswer(answer.id))}
                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all ${answer.revealed
                  ? 'bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] border border-[#514532]'
                  : 'bg-[#ffb800] hover:bg-[#ffc633] text-black shadow-md'
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
