import React from 'react';
import { useGame } from '../context/GameContext';
import { RoundType } from '../types/game';
import { Radio, Tv, Sliders, DollarSign, Database, Share2, Wifi } from 'lucide-react';

interface HeaderProps {
  currentTab: 'host' | 'stage' | 'fast_money';
  setCurrentTab: (tab: 'host' | 'stage' | 'fast_money') => void;
  openSurveyBank: () => void;
  openSessionModal: () => void;
}

export function Header({ currentTab, setCurrentTab, openSurveyBank, openSessionModal }: HeaderProps) {
  const { gameState, setRound, isConnected, latency, gameId } = useGame();

  const handleRoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRound(e.target.value as RoundType);
  };

  const openProjectorWindow = () => {
    const url = `${window.location.origin}${window.location.pathname}?tab=stage&game=${gameId}`;
    window.open(url, '_blank');
  };

  return (
    <header className="bg-[#090e1b] border-b border-[#252a38] px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left Brand & Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#ffb800] to-[#b45309] flex items-center justify-center font-bebas text-xl text-black font-bold tracking-wider shadow-md">
            FF
          </div>
          <div>
            <div className="font-bebas text-xl tracking-wider text-[#ffdca1] leading-none flex items-center gap-1.5">
              FAMILY FEUD
              <span className="text-[10px] tracking-normal font-sans uppercase px-1.5 py-0.5 rounded bg-[#252a38] text-[#d5c4ab] font-semibold">
                STUDIO OPERATIONS
              </span>
            </div>
            <div className="text-[11px] text-[#9e8f78] font-space tracking-tight leading-none mt-0.5">
              BROADCAST CONTROL SYSTEM
            </div>
          </div>
        </div>

        {/* Live On Air Badge */}
        <div className="flex items-center space-x-1.5 bg-[#93000a]/40 border border-[#ef4444]/60 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#ffdad6]">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></span>
          <span className="font-space tracking-wider uppercase">LIVE ON AIR</span>
        </div>

        {/* Round Dropdown Selector */}
        <div className="hidden sm:flex items-center bg-[#171b29] border border-[#303443] rounded px-2.5 py-1 text-xs">
          <span className="text-[#9e8f78] uppercase font-semibold mr-2 text-[10px] tracking-wider">
            STAGE ROUND
          </span>
          <select
            value={gameState.currentRound}
            onChange={handleRoundChange}
            className="bg-transparent text-[#ffdca1] font-semibold text-xs focus:outline-none cursor-pointer"
          >
            <option value="r1" className="bg-[#171b29] text-[#dee2f5]">Round 1 (Single)</option>
            <option value="r2" className="bg-[#171b29] text-[#dee2f5]">Round 2 (Double ×2)</option>
            <option value="r3" className="bg-[#171b29] text-[#dee2f5]">Round 3 (Triple ×3)</option>
            <option value="fast_money" className="bg-[#171b29] text-[#dee2f5]">Fast Money</option>
          </select>
        </div>
      </div>

      {/* Center Nav Tabs */}
      <div className="flex items-center space-x-1 bg-[#171b29] p-1 rounded-lg border border-[#252a38]">
        <button
          onClick={() => setCurrentTab('host')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
            currentTab === 'host'
              ? 'bg-[#ffb800] text-black shadow-md font-bold'
              : 'text-[#dee2f5] hover:bg-[#252a38] hover:text-[#ffdca1]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Host & Admin Console</span>
        </button>

        <button
          onClick={() => setCurrentTab('stage')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
            currentTab === 'stage'
              ? 'bg-[#ffb800] text-black shadow-md font-bold'
              : 'text-[#dee2f5] hover:bg-[#252a38] hover:text-[#ffdca1]'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Stage Gameboard</span>
        </button>

        <button
          onClick={() => setCurrentTab('fast_money')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
            currentTab === 'fast_money'
              ? 'bg-[#ffb800] text-black shadow-md font-bold'
              : 'text-[#dee2f5] hover:bg-[#252a38] hover:text-[#ffdca1]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Fast Money</span>
        </button>

        <button
          onClick={openSurveyBank}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#dee2f5] hover:bg-[#252a38] hover:text-[#ffdca1] transition-all"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Survey Bank</span>
        </button>
      </div>

      {/* Right Sync & Session Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={openSessionModal}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#1b1f2d] hover:bg-[#252a38] border border-[#303443] text-xs font-mono-score text-[#dee2f5] transition-colors"
          title="Game Room Session Details"
        >
          <span className="text-[#9e8f78] text-[10px]">ROOM:</span>
          <span className="text-[#00e3fd] font-bold">{gameId}</span>
        </button>

        <button
          onClick={openSessionModal}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            isConnected
              ? 'bg-[#171b29] border-[#00e3fd]/40 text-[#bdf4ff]'
              : 'bg-[#93000a]/20 border-[#ffb4ab]/40 text-[#ffb4ab]'
          }`}
          title={`Sync status: ${isConnected ? 'Connected' : 'Reconnecting'} (${latency}ms)`}
        >
          <Wifi className="w-3 h-3 text-[#00e3fd]" />
          <span className="hidden lg:inline text-[11px] font-mono-score">SYNC 60FPS</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-[#00e3fd] animate-pulse' : 'bg-red-500'
            }`}
          />
        </button>

        <button
          onClick={openProjectorWindow}
          className="p-1.5 rounded hover:bg-[#252a38] text-[#9e8f78] hover:text-[#dee2f5] transition-colors"
          title="Open Stage Gameboard in New Window / Projector"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
