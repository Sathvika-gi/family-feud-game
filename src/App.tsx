/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { Header } from './components/Header';
import { HostConsole } from './components/HostConsole';
import { StageGameboard } from './components/StageGameboard';
import { FastMoney } from './components/FastMoney';
import { SurveyBankModal } from './components/SurveyBankModal';
import { GameSessionModal } from './components/GameSessionModal';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<'host' | 'stage' | 'fast_money'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'stage' || tab === 'fast_money' || tab === 'host') {
        return tab;
      }
    }
    return 'host';
  });

  const [isSurveyBankOpen, setIsSurveyBankOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Sync tab change with URL query parameter without page reload
  const handleTabChange = (tab: 'host' | 'stage' | 'fast_money') => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1320] text-[#dee2f5] flex flex-col font-space selection:bg-[#ffb800] selection:text-black">
      <Header
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        openSurveyBank={() => setIsSurveyBankOpen(true)}
        openSessionModal={() => setIsSessionModalOpen(true)}
      />

      <main className="flex-1 pb-10">
        {currentTab === 'host' && (
          <HostConsole openSurveyBank={() => setIsSurveyBankOpen(true)} />
        )}
        {currentTab === 'stage' && <StageGameboard />}
        {currentTab === 'fast_money' && <FastMoney />}
      </main>

      <SurveyBankModal
        isOpen={isSurveyBankOpen}
        onClose={() => setIsSurveyBankOpen(false)}
      />

      <GameSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}
