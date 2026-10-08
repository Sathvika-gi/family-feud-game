import React from 'react';
import { useGame } from '../context/GameContext';
import { RoundType } from '../types/game';
import {
  Trophy,
  RotateCcw,
  SkipForward,
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
  Edit2
} from 'lucide-react';

interface HostConsoleProps {
  openSurveyBank: () => void;
}

export function HostConsole({ openSurveyBank }: HostConsoleProps) {
  const {
    gameState,
    currentQuestion,
    currentPot,
    revealedCount,
    totalAnswersCount,
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
    updateQuestionText,
    updateAnswer,
    playSfxDirect,
    latency,
    gameId,
  } = useGame();

  const team1 = gameState.teams[0];
  const team2 = gameState.teams[1];

  const totalQuestionPoints =
    currentQuestion?.answers.reduce((acc, a) => acc + a.points, 0) || 0;

  const revealedBasePoints =
    currentQuestion?.answers
      .filter((a) => a.revealed)
      .reduce((acc, a) => acc + a.points, 0) || 0;

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 space-y-6">
      {/* Top Console Bar */}
      <div className="bg-[#171b29] border border-[#252a38] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Round pills */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0e1320] border border-[#303443] text-xs font-bold text-[#ffdca1] uppercase mr-2">
            <span className="w-2 h-2 rounded-full bg-[#ffb800]"></span>
            HOST CONSOLE
          </div>

          {(['r1', 'r2', 'r3', 'fast_money'] as RoundType[]).map((r) => {
            const labels: Record<RoundType, string> = {
              r1: 'R1 (Single)',
              r2: 'R2 (Double ×2)',
              r3: 'R3 (Triple ×3)',
              fast_money: 'Fast Money',
            };
            const isActive = gameState.currentRound === r;
            return (
              <button
                key={r}
                onClick={() => setRound(r)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#ffb800] text-black shadow-md'
                    : 'bg-[#1b1f2d] text-[#dee2f5] hover:bg-[#252a38] hover:text-[#ffdca1]'
                }`}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>

        {/* Center: Stage status */}
        <div className="flex items-center space-x-2 text-xs font-mono-score bg-[#0e1320] px-3.5 py-1.5 rounded-lg border border-[#303443]">
          <span className="w-2 h-2 rounded-full bg-[#00e3fd] animate-pulse"></span>
          <span className="text-[#9e8f78] uppercase">STAGE DISPLAY STATUS:</span>
          <span className="text-[#dee2f5] font-bold">
            BOARD ACTIVE ({revealedCount}/{totalAnswersCount} REVEALED • {currentPot} POT)
          </span>
        </div>

        {/* Right: Round & Game Reset Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={nextRound}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] text-xs font-semibold border border-[#514532] transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5 text-[#ffb800]" />
            <span>Next Round</span>
          </button>
          <button
            onClick={resetRound}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] text-xs font-semibold border border-[#514532] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00e3fd]" />
            <span>Reset Round</span>
          </button>
          <button
            onClick={newGame}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#93000a]/30 hover:bg-[#93000a]/60 text-[#ffb4ab] text-xs font-semibold border border-[#ffb4ab]/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Game</span>
          </button>
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
          <div className="text-[11px] font-mono-score uppercase tracking-wider text-[#00e3fd] bg-[#00e3fd]/10 px-2.5 py-0.5 rounded border border-[#00e3fd]/30">
            TURN SELECTORS SYNC WITH STAGE DISPLAYS
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Team 1 Card */}
          <div
            className={`p-4 rounded-lg border transition-all ${
              gameState.currentTeamId === team1.id
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
                <label className="block text-[10px] uppercase font-bold text-[#9e8f78] mb-1">
                  STARTING SCORE
                </label>
                <div className="flex items-center bg-[#0e1320] border border-[#303443] rounded">
                  <input
                    type="number"
                    value={team1.score}
                    onChange={(e) => setTeamScore(team1.id, parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent px-2 py-1.5 font-mono-score font-bold text-sm text-[#00e3fd] text-center focus:outline-none"
                  />
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
                CAPTAIN & MEMBERS (ROSTER)
              </label>
              <input
                type="text"
                value={team1.members}
                onChange={(e) => updateTeamInfo(team1.id, { members: e.target.value })}
                className="w-full bg-[#0e1320] border border-[#303443] rounded px-3 py-1 text-xs text-[#d5c4ab] focus:outline-none focus:border-[#00e3fd]"
              />
            </div>
          </div>

          {/* Team 2 Card */}
          <div
            className={`p-4 rounded-lg border transition-all ${
              gameState.currentTeamId === team2.id
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
                <input
                  type="text"
                  value={team2.name}
                  onChange={(e) => updateTeamInfo(team2.id, { name: e.target.value })}
                  className="w-full bg-[#0e1320] border border-[#303443] rounded px-3 py-1.5 font-bold text-sm text-[#dee2f5] focus:outline-none focus:border-[#ffb800]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#9e8f78] mb-1">
                  STARTING SCORE
                </label>
                <div className="flex items-center bg-[#0e1320] border border-[#303443] rounded">
                  <input
                    type="number"
                    value={team2.score}
                    onChange={(e) => setTeamScore(team2.id, parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent px-2 py-1.5 font-mono-score font-bold text-sm text-[#ffb800] text-center focus:outline-none"
                  />
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
                CAPTAIN & MEMBERS (ROSTER)
              </label>
              <input
                type="text"
                value={team2.members}
                onChange={(e) => updateTeamInfo(team2.id, { members: e.target.value })}
                className="w-full bg-[#0e1320] border border-[#303443] rounded px-3 py-1 text-xs text-[#d5c4ab] focus:outline-none focus:border-[#ffb800]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SURVEY QUESTION & ANSWERS CREATOR / EDITOR */}
      <section className="bg-[#171b29] border border-[#252a38] rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#252a38]">
          <div className="flex items-center space-x-2">
            <span className="font-bebas text-lg text-[#ffdca1] tracking-wider">
              2. SURVEY QUESTION & ANSWERS CREATOR / EDITOR
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
                onClick={openSurveyBank}
                className="flex items-center space-x-1 text-xs text-[#00e3fd] hover:text-[#bdf4ff] font-semibold underline"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Survey Bank</span>
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
              className={`p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 transition-all ${
                answer.revealed
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

              {/* Points input */}
              <div className="flex items-center bg-[#171b29] border border-[#303443] rounded px-2 py-0.5">
                <input
                  type="number"
                  value={answer.points}
                  onChange={(e) => updateAnswer(answer.id, { points: parseInt(e.target.value) || 0 })}
                  className="w-10 bg-transparent text-center font-mono-score font-bold text-xs text-[#ffb800] focus:outline-none"
                />
                <span className="text-[10px] text-[#9e8f78] uppercase ml-1">pts</span>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono-score font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  answer.revealed
                    ? 'bg-[#ffb800]/20 text-[#ffb800] border border-[#ffb800]/40'
                    : 'bg-[#252a38] text-[#9e8f78]'
                }`}
              >
                {answer.revealed ? 'REVEALED' : 'HIDDEN'}
              </span>

              {/* Quick Point Awards to Teams */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => awardAnswerToTeam(answer.id, team1.id)}
                  className="px-2 py-1 rounded bg-[#00e3fd]/10 hover:bg-[#00e3fd]/25 text-[#00e3fd] text-[10px] font-bold uppercase tracking-tight border border-[#00e3fd]/30 transition-colors"
                  title={`Award ${answer.points * gameState.roundMultiplier} pts to ${team1.name}`}
                >
                  + {team1.name.split(' ')[0]}
                </button>
                <button
                  onClick={() => awardAnswerToTeam(answer.id, team2.id)}
                  className="px-2 py-1 rounded bg-[#ffb0b3]/10 hover:bg-[#ffb0b3]/25 text-[#ffb0b3] text-[10px] font-bold uppercase tracking-tight border border-[#ffb0b3]/30 transition-colors"
                  title={`Award ${answer.points * gameState.roundMultiplier} pts to ${team2.name}`}
                >
                  + {team2.name.split(' ')[0]}
                </button>
              </div>

              {/* Toggle Reveal Button */}
              <button
                onClick={() => (answer.revealed ? hideAnswer(answer.id) : revealAnswer(answer.id))}
                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  answer.revealed
                    ? 'bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] border border-[#514532]'
                    : 'bg-[#ffb800] hover:bg-[#ffc633] text-black shadow-md'
                }`}
              >
                {answer.revealed ? 'HIDE' : 'REVEAL'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: LIVE GAME CONTROL & POINT ALLOCATION PANEL */}
      <section className="bg-[#171b29] border border-[#252a38] rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#252a38]">
          <div className="flex items-center space-x-2">
            <span className="font-bebas text-lg text-[#ffdca1] tracking-wider">
              3. LIVE GAME CONTROL & POINT ALLOCATION PANEL
            </span>
          </div>

          {/* Current Round Pot badge */}
          <div className="bg-[#0e1320] border border-[#ffb800]/50 rounded-lg px-4 py-1.5 flex items-center space-x-3 shadow-md">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-[#9e8f78] tracking-wider">
                CURRENT ROUND POT
              </div>
              <div className="text-xs font-mono-score text-[#d5c4ab]">
                ({revealedBasePoints}) × {gameState.roundMultiplier} MULTIPLIER
              </div>
            </div>
            <div className="font-bebas text-2xl md:text-3xl text-[#ffb800] leading-none">
              {currentPot} PTS
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team 1 Panel */}
          <div className="bg-[#1b1f2d] border border-[#303443] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252a38]">
              <div>
                <span className="text-xs font-bold uppercase text-[#00e3fd]">
                  ● TEAM 1 • STAGE LEFT
                </span>
                <h3 className="font-bebas text-2xl text-[#dee2f5] tracking-wide">
                  {team1.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#9e8f78]">
                  TOTAL SCORE
                </span>
                <div className="font-mono-score text-3xl font-bold text-[#00e3fd]">
                  {team1.score} <span className="text-xs font-sans text-[#9e8f78]">PTS</span>
                </div>
              </div>
            </div>

            {/* Strikes indicator & controls */}
            <div className="flex items-center justify-between bg-[#0e1320] p-3 rounded-lg border border-[#252a38]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#9e8f78] uppercase mr-1">STRIKES:</span>
                {[1, 2, 3].map((index) => {
                  const isStrike = team1.strikes >= index;
                  return (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded flex items-center justify-center font-bebas text-xl font-bold transition-all ${
                        isStrike
                          ? 'bg-[#93000a] text-[#ffdad6] border border-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                          : 'bg-[#1b1f2d] text-[#514532] border border-[#303443]'
                      }`}
                    >
                      {isStrike ? 'X' : '-'}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addStrike(team1.id)}
                  className="px-2.5 py-1 rounded bg-[#93000a]/30 hover:bg-[#93000a]/60 text-[#ffb4ab] text-xs font-bold uppercase border border-[#ffb4ab]/40 transition-colors"
                >
                  +1 STRIKE
                </button>
                <button
                  onClick={() => clearStrikes(team1.id)}
                  className="px-2.5 py-1 rounded bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] text-xs font-semibold uppercase border border-[#514532] transition-colors"
                >
                  CLEAR STRIKES
                </button>
              </div>
            </div>

            {/* Award Pot Button */}
            <button
              onClick={() => awardPotToTeam(team1.id)}
              className="w-full py-3 px-4 rounded-lg bg-[#ffb800] hover:bg-[#ffc633] text-black font-bebas text-xl tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-[0.99]"
            >
              <Trophy className="w-5 h-5 text-black" />
              <span>AWARD CURRENT POT ({currentPot} PTS) TO {team1.name}</span>
            </button>

            {/* Manual score adjust */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold text-[#9e8f78] uppercase">
                MANUAL ADJUST:
              </span>
              <div className="flex items-center space-x-1.5">
                {[+5, +10, +25, +50, -10].map((delta) => (
                  <button
                    key={delta}
                    onClick={() => adjustTeamScore(team1.id, delta)}
                    className="px-2.5 py-1 rounded bg-[#0e1320] hover:bg-[#252a38] text-xs font-mono-score font-bold text-[#dee2f5] border border-[#303443] transition-colors"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Team 2 Panel */}
          <div className="bg-[#1b1f2d] border border-[#303443] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#252a38]">
              <div>
                <span className="text-xs font-bold uppercase text-[#ffb0b3]">
                  ● TEAM 2 • STAGE RIGHT
                </span>
                <h3 className="font-bebas text-2xl text-[#dee2f5] tracking-wide">
                  {team2.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#9e8f78]">
                  TOTAL SCORE
                </span>
                <div className="font-mono-score text-3xl font-bold text-[#ffb800]">
                  {team2.score} <span className="text-xs font-sans text-[#9e8f78]">PTS</span>
                </div>
              </div>
            </div>

            {/* Strikes indicator & controls */}
            <div className="flex items-center justify-between bg-[#0e1320] p-3 rounded-lg border border-[#252a38]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#9e8f78] uppercase mr-1">STRIKES:</span>
                {[1, 2, 3].map((index) => {
                  const isStrike = team2.strikes >= index;
                  return (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded flex items-center justify-center font-bebas text-xl font-bold transition-all ${
                        isStrike
                          ? 'bg-[#93000a] text-[#ffdad6] border border-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                          : 'bg-[#1b1f2d] text-[#514532] border border-[#303443]'
                      }`}
                    >
                      {isStrike ? 'X' : '-'}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addStrike(team2.id)}
                  className="px-2.5 py-1 rounded bg-[#93000a]/30 hover:bg-[#93000a]/60 text-[#ffb4ab] text-xs font-bold uppercase border border-[#ffb4ab]/40 transition-colors"
                >
                  +1 STRIKE
                </button>
                <button
                  onClick={() => clearStrikes(team2.id)}
                  className="px-2.5 py-1 rounded bg-[#252a38] hover:bg-[#343948] text-[#dee2f5] text-xs font-semibold uppercase border border-[#514532] transition-colors"
                >
                  CLEAR STRIKES
                </button>
              </div>
            </div>

            {/* Award Pot Button */}
            <button
              onClick={() => awardPotToTeam(team2.id)}
              className="w-full py-3 px-4 rounded-lg bg-[#ffb800] hover:bg-[#ffc633] text-black font-bebas text-xl tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-[0.99]"
            >
              <Trophy className="w-5 h-5 text-black" />
              <span>AWARD CURRENT POT ({currentPot} PTS) TO {team2.name}</span>
            </button>

            {/* Manual score adjust */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold text-[#9e8f78] uppercase">
                MANUAL ADJUST:
              </span>
              <div className="flex items-center space-x-1.5">
                {[+5, +10, +25, +50, -10].map((delta) => (
                  <button
                    key={delta}
                    onClick={() => adjustTeamScore(team2.id, delta)}
                    className="px-2.5 py-1 rounded bg-[#0e1320] hover:bg-[#252a38] text-xs font-mono-score font-bold text-[#dee2f5] border border-[#303443] transition-colors"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BROADCAST SFX QUICK TRIGGERS BAR */}
      <div className="bg-[#171b29] border border-[#252a38] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase text-[#ffdca1] tracking-wider">
          <Volume2 className="w-4 h-4 text-[#ffb800]" />
          <span>BROADCAST SFX QUICK TRIGGERS</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => playSfxDirect('ding')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0e1320] hover:bg-[#252a38] text-[#00e3fd] text-xs font-bold border border-[#00e3fd]/30 transition-all hover:scale-105 active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00e3fd]" />
            <span>DING (Correct)</span>
          </button>

          <button
            onClick={() => playSfxDirect('buzz')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0e1320] hover:bg-[#252a38] text-[#ffb4ab] text-xs font-bold border border-[#ef4444]/30 transition-all hover:scale-105 active:scale-95"
          >
            <XCircle className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>BUZZ (Wrong)</span>
          </button>

          <button
            onClick={() => playSfxDirect('strike3')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffdad6] text-xs font-bold border border-[#ef4444]/50 transition-all hover:scale-105 active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>STRIKE HORN (3X)</span>
          </button>

          <button
            onClick={() => playSfxDirect('bell')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0e1320] hover:bg-[#252a38] text-[#ffdca1] text-xs font-bold border border-[#ffb800]/30 transition-all hover:scale-105 active:scale-95"
          >
            <Bell className="w-3.5 h-3.5 text-[#ffb800]" />
            <span>FACE-OFF BELL</span>
          </button>

          <button
            onClick={() => playSfxDirect('fanfare')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#ffb800]/15 hover:bg-[#ffb800]/30 text-[#ffdca1] text-xs font-bold border border-[#ffb800]/50 transition-all hover:scale-105 active:scale-95"
          >
            <Music className="w-3.5 h-3.5 text-[#ffb800]" />
            <span>WIN FANFARE</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono-score text-[#00e3fd]">
          <span>LATENCY: {latency}MS</span>
          <span className="w-2 h-2 rounded-full bg-[#00e3fd] animate-pulse"></span>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="pt-4 pb-8 flex flex-wrap items-center justify-between text-xs text-[#9e8f78] border-t border-[#252a38] font-space gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bebas text-sm text-[#ffdca1] tracking-wider">
            BROADCAST CONTROL SUITE
          </span>
          <span className="font-mono-score text-[11px] bg-[#171b29] px-2 py-0.5 rounded border border-[#303443]">
            FEED ID #{gameId}
          </span>
        </div>
        <div className="text-[11px]">
          © 2025 FremantleMedia Group • Official Digital Stage System. Low-latency operational terminal.
        </div>
      </footer>
    </div>
  );
}
