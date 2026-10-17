/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Skull, RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  timeElapsed: number;
  puzzlesSolved: number;
  capturesCount: number;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  timeElapsed,
  puzzlesSolved,
  capturesCount,
  onRetry,
  onMainMenu,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-950 border-2 border-red-600 rounded-2xl shadow-2xl shadow-red-950/80 p-6 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center animate-bounce">
          <Skull className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-1">
          <h2 className="font-mono text-2xl font-black text-red-500 tracking-wider">
            YOU HAVE BEEN CAPTURED
          </h2>
          <p className="text-xs font-mono text-slate-400">
            THE HACKER HAS INTERCEPTED YOUR ESCAPE ROUTE
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl grid grid-cols-3 gap-2 font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-500">TIME SURVIVED</div>
            <div className="text-sm font-bold text-white">{formatTime(timeElapsed)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">PUZZLES SOLVED</div>
            <div className="text-sm font-bold text-cyan-400">{puzzlesSolved}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">CAPTURES</div>
            <div className="text-sm font-bold text-red-400">{capturesCount}</div>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          You used up both of your escape chances (2/2 attempts). You always get 2 chances per run!
          Remember: hold crouch <strong className="text-white font-mono">[CTRL]</strong> to move completely silently.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onMainMenu}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs rounded-xl transition"
          >
            MAIN MENU
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY ESCAPE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
