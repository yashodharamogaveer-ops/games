/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, HelpCircle, Settings, Home, X } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onOpenHowToPlay,
  onOpenSettings,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-2xl p-6 space-y-6 text-center">
        <div className="space-y-1">
          <h2 className="font-mono text-2xl font-black text-cyan-400 tracking-wider">
            GAME PAUSED
          </h2>
          <p className="text-xs font-mono text-slate-400">SESSION SUSPENDED</p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME ESCAPE</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>RESTART CURRENT RUN</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>CONTROLS & HINTS</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-mono text-xs rounded-xl transition flex items-center justify-center gap-2 pt-1"
          >
            <Home className="w-4 h-4" />
            <span>QUIT TO MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
