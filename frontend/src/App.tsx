/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { HostConsole } from './components/HostConsole';
import { StageGameboard } from './components/StageGameboard';

function MainApp() {
  const [currentView, setCurrentView] = useState<'host' | 'stage'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || params.get('view');
      if (tab === 'stage') {
        return 'stage';
      }
      if (window.location.pathname.toLowerCase() === '/stage') {
        return 'stage';
      }
    }
    return 'host';
  });

  // Sync route change with URL query parameter
  const handleViewChange = (view: 'host' | 'stage') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', view);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || params.get('view');
      if (tab === 'stage') {
        setCurrentView('stage');
      } else {
        setCurrentView('host');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-[#0e1320] text-[#dee2f5] flex flex-col font-space selection:bg-[#ffb800] selection:text-black">
      <main className="flex-1">
        {currentView === 'host' ? (
          <HostConsole onSwitchToStage={() => handleViewChange('stage')} />
        ) : (
          <div className="pt-2">
            <StageGameboard onSwitchToHost={() => handleViewChange('host')} />
          </div>
        )}
      </main>
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
