import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, Copy, Check, Tv, Sliders, Users, ExternalLink } from 'lucide-react';

interface GameSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameSessionModal({ isOpen, onClose }: GameSessionModalProps) {
  const { gameId, setGameId, isConnected, latency } = useGame();
  const [inputGameId, setInputGameId] = useState('');
  const [copiedLink, setCopiedLink] = useState<'stage' | 'host' | null>(null);

  if (!isOpen) return null;

  const stageUrl = `${window.location.origin}${window.location.pathname}?tab=stage&game=${gameId}`;
  const hostUrl = `${window.location.origin}${window.location.pathname}?tab=host&game=${gameId}`;

  const copyToClipboard = (text: string, type: 'stage' | 'host') => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleJoinOrCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGameId.trim()) return;
    setGameId(inputGameId.trim().toUpperCase());
    setInputGameId('');
    onClose();
  };

  const handleCreateNewGameId = () => {
    const randomCode = `FF-${Math.floor(10000 + Math.random() * 90000)}`;
    setGameId(randomCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#171b29] border border-[#ffb800]/50 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#252a38] pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#ffb800]" />
            <h2 className="font-bebas text-2xl text-[#ffdca1] tracking-wider">
              REAL-TIME GAME SESSION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9e8f78] hover:text-white hover:bg-[#252a38]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Room Info */}
        <div className="bg-[#0e1320] border border-[#303443] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono-score uppercase text-[#9e8f78]">
              CURRENT ACTIVE GAME ID
            </div>
            <div className="font-bebas text-3xl text-[#00e3fd] tracking-widest leading-none mt-1">
              {gameId}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1.5 text-xs font-mono-score justify-end">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00e3fd] animate-pulse' : 'bg-red-500'}`}></span>
              <span className={isConnected ? 'text-[#00e3fd]' : 'text-red-400'}>
                {isConnected ? 'ONLINE' : 'RECONNECTING'}
              </span>
            </div>
            <div className="text-[11px] font-mono-score text-[#9e8f78] mt-0.5">
              LATENCY: {latency}ms
            </div>
          </div>
        </div>

        {/* Multi-Screen / Remote Sync Links */}
        <div className="space-y-3">
          <label className="text-xs font-mono-score uppercase font-bold text-[#ffdca1] block">
            MULTI-SCREEN DISPLAY LINKS
          </label>

          {/* Stage Display Link */}
          <div className="bg-[#1b1f2d] border border-[#252a38] p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Tv className="w-4 h-4 text-[#ffb800]" />
              <div>
                <div className="text-xs font-bold text-[#dee2f5]">Stage Gameboard Display</div>
                <div className="text-[11px] text-[#9e8f78]">For big screen / projector / TV</div>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => copyToClipboard(stageUrl, 'stage')}
                className="px-2.5 py-1 rounded bg-[#252a38] hover:bg-[#343948] text-xs text-[#dee2f5] font-semibold flex items-center space-x-1 border border-[#514532]"
              >
                {copiedLink === 'stage' ? <Check className="w-3.5 h-3.5 text-[#00e3fd]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === 'stage' ? 'Copied' : 'Copy URL'}</span>
              </button>
              <a
                href={stageUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded bg-[#ffb800] text-black hover:bg-[#ffc633]"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Host Admin Link */}
          <div className="bg-[#1b1f2d] border border-[#252a38] p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Sliders className="w-4 h-4 text-[#00e3fd]" />
              <div>
                <div className="text-xs font-bold text-[#dee2f5]">Host Admin Controller</div>
                <div className="text-[11px] text-[#9e8f78]">For phone, tablet, or secondary laptop</div>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => copyToClipboard(hostUrl, 'host')}
                className="px-2.5 py-1 rounded bg-[#252a38] hover:bg-[#343948] text-xs text-[#dee2f5] font-semibold flex items-center space-x-1 border border-[#514532]"
              >
                {copiedLink === 'host' ? <Check className="w-3.5 h-3.5 text-[#00e3fd]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === 'host' ? 'Copied' : 'Copy URL'}</span>
              </button>
              <a
                href={hostUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded bg-[#00e3fd] text-black hover:bg-[#9cf0ff]"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Join or Create another game */}
        <form onSubmit={handleJoinOrCreate} className="space-y-3 pt-2 border-t border-[#252a38]">
          <label className="text-xs font-mono-score uppercase font-bold text-[#ffdca1] block">
            JOIN DIFFERENT GAME ROOM CODE
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. ABC123"
              value={inputGameId}
              onChange={(e) => setInputGameId(e.target.value.toUpperCase())}
              className="flex-1 bg-[#0e1320] border border-[#303443] rounded-lg px-3 py-2 text-xs font-mono-score font-bold uppercase text-[#00e3fd] focus:outline-none focus:border-[#ffb800]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#252a38] hover:bg-[#343948] text-[#ffdca1] text-xs font-bold uppercase border border-[#514532]"
            >
              SWITCH ROOM
            </button>
          </div>

          <button
            type="button"
            onClick={handleCreateNewGameId}
            className="w-full py-2 rounded-lg bg-[#ffb800] hover:bg-[#ffc633] text-black font-bold text-xs uppercase tracking-wider"
          >
            CREATE BRAND NEW RANDOM GAME ROOM
          </button>
        </form>
      </div>
    </div>
  );
}
