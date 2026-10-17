/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  Timer,
  HelpCircle,
  Trophy,
  Settings,
  Info,
  ShieldAlert,
  Terminal,
  Cpu,
} from 'lucide-react';
import { AudioManager } from '../game/AudioManager.ts';

interface MainMenuProps {
  onStartGame: (challengeLimit?: number) => void;
  onOpenHowToPlay: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenHowToPlay,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const [showAbout, setShowAbout] = useState(false);

  const handlePlayClick = (challengeMinutes = 0) => {
    AudioManager.getInstance().playAccessGranted();
    onStartGame(challengeMinutes * 60);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950 select-none overflow-hidden">
      {/* Cinematic Cyber Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/25 via-slate-950 to-black pointer-events-none"></div>

      {/* Grid Scanline overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl mx-4 p-6 sm:p-8 bg-slate-950/90 border-2 border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-950/50 backdrop-blur-md flex flex-col items-center text-center space-y-6">
        {/* Exhibition Badge */}
        <div className="px-3.5 py-1 bg-cyan-950/80 border border-cyan-500/50 rounded-full font-mono text-[11px] font-bold text-cyan-400 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>COLLEGE IT EXHIBITION SPECIAL EDITION // LIVE 3D</span>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            HACKER'S TRAP
          </h1>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-cyan-400">
            THE LAST EXIT
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-md mx-auto pt-1 leading-relaxed">
            A real-time first-person 3D escape thriller. Navigate an interconnected villa, crack
            procedural cipher locks, evade the patrolling hacker AI, and find the final exit.
          </p>
        </div>

        {/* Action Menu Buttons */}
        <div className="w-full max-w-sm space-y-2.5">
          {/* Main Play */}
          <button
            onClick={() => handlePlayClick(0)}
            className="w-full py-3.5 px-6 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-mono font-black text-sm rounded-xl transition shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2.5 group"
          >
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span>PLAY GAME (STANDARD ESCAPE)</span>
          </button>

          {/* Exhibition Speed Challenge */}
          <button
            onClick={() => handlePlayClick(3)}
            className="w-full py-3 px-6 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-300 font-mono font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <Timer className="w-4 h-4 text-amber-400" />
            <span>EXHIBITION CHALLENGE (3-MIN SPEED RUN)</span>
          </button>

          {/* Secondary Options */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onOpenHowToPlay}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>HOW TO PLAY</span>
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>LEADERBOARD</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenSettings}
              className="py-2 px-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>SETTINGS</span>
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="py-2 px-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>ABOUT PROJECT</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center gap-2">
          <span>Three.js PBR Engine</span>
          <span>•</span>
          <span>Web Audio API</span>
          <span>•</span>
          <span>Procedural AI</span>
        </div>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none">
          <div className="w-full max-w-lg bg-slate-950 border border-cyan-500/50 rounded-2xl p-6 space-y-4 text-left font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-mono text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> ABOUT THIS EXHIBITION PROJECT
              </h3>
              <button
                onClick={() => setShowAbout(false)}
                className="text-slate-400 hover:text-white font-mono text-xs"
              >
                CLOSE
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Hacker's Trap: The Last Exit</strong> is an original 3D game created for the
              College IT Exhibition. It demonstrates real-time WebGL rendering with Three.js,
              procedural level architecture, state-machine enemy AI, mathematical puzzle algorithms,
              and browser-synthesized audio without any external API or asset dependencies.
            </p>
            <div className="p-3 bg-slate-900 rounded-xl space-y-1 font-mono text-xs text-slate-400">
              <div>• Interactive 6-Door Atrium System</div>
              <div>• Dynamic SVG Fog-of-War Floor Plan Map HUD</div>
              <div>• Sensory Hacker AI (Line of Sight + Hearing detection)</div>
              <div>• Real-time First-Person Keyboard & PointerLock Mouse Look</div>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl transition"
            >
              BACK TO MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
