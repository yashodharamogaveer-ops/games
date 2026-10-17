/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InteractiveObject } from '../game/types.ts';
import {
  ShieldAlert,
  Flashlight,
  Volume2,
  VolumeX,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AudioManager } from '../game/AudioManager.ts';
import { InventorySystem } from '../game/InventorySystem.ts';

interface GameHUDProps {
  objective: string;
  timeElapsed: number;
  puzzlesSolved: number;
  alertLevel: number;
  hackerState: string;
  hackerStrikes?: number;
  layoutName?: string;
  focusedInteractive: InteractiveObject | null;
  isFlashlightOn: boolean;
  difficulty: 'easy' | 'normal';
  challengeTimeLimit: number;
  bannerMessage: { text: string; type: 'info' | 'warning' | 'success' } | null;
  onToggleFlashlight: () => void;
  onUseEMP: () => void;
  onPause: () => void;
  onOpenInventory: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  objective,
  timeElapsed,
  puzzlesSolved,
  alertLevel,
  hackerState,
  hackerStrikes = 0,
  layoutName = 'STANDARD COMPOUND',
  focusedInteractive,
  isFlashlightOn,
  difficulty,
  challengeTimeLimit,
  bannerMessage,
  onToggleFlashlight,
  onUseEMP,
  onPause,
  onOpenInventory,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(AudioManager.getInstance().isSoundMuted());
  const hasEMP = InventorySystem.getInstance().hasItem('item_emp_device');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    AudioManager.getInstance().setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  // Remaining time if challenge mode
  const remainingSeconds = challengeTimeLimit > 0 ? Math.max(0, challengeTimeLimit - timeElapsed) : 0;

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-20 overflow-hidden">
      {/* Red screen border flash when in CHASE state */}
      {hackerState === 'CHASE' && (
        <div className="absolute inset-0 border-4 border-red-600/80 pointer-events-none animate-pulse"></div>
      )}

      {/* TOP LEFT: Mission Objective Tracker */}
      <div className="absolute top-4 left-4 pointer-events-auto max-w-sm">
        <div className="p-3.5 bg-slate-950/85 border border-cyan-500/40 rounded-xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> OBJECTIVE
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 uppercase text-[9px] font-mono font-bold">
                {layoutName}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase text-[10px]">
                {difficulty}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-tight">
            {objective}
          </p>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div>
              TIME: <span className="text-cyan-300 font-bold">{formatTime(timeElapsed)}</span>
              {challengeTimeLimit > 0 && (
                <span className={`ml-1 font-bold ${remainingSeconds < 30 ? 'text-red-400' : 'text-amber-400'}`}>
                  (LEFT: {formatTime(remainingSeconds)})
                </span>
              )}
            </div>
            <div>
              SOLVED: <span className="text-cyan-300 font-bold">{puzzlesSolved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP CENTER: Security Alert Meter & Threat Status */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="px-5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl shadow-xl flex items-center gap-4 min-w-[320px]">
          <div className="flex items-center gap-2">
            <ShieldAlert
              className={`w-5 h-5 ${
                hackerState === 'CHASE'
                  ? 'text-red-500 animate-bounce'
                  : hackerState === 'INVESTIGATE'
                  ? 'text-amber-500'
                  : 'text-slate-400'
              }`}
            />
            <div>
              <div className="text-[10px] font-mono text-slate-400 leading-none">HACKER THREAT</div>
              <div
                className={`text-xs font-mono font-bold leading-tight ${
                  hackerState === 'CHASE'
                    ? 'text-red-400 font-black'
                    : hackerState === 'INVESTIGATE'
                    ? 'text-amber-400'
                    : 'text-slate-200'
                }`}
              >
                {hackerState}
              </div>
            </div>
          </div>

          {/* Alert progress bar */}
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>ALERT</span>
              <span>{Math.round(alertLevel)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  alertLevel > 60
                    ? 'bg-red-500'
                    : alertLevel > 30
                    ? 'bg-amber-400'
                    : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, alertLevel)}%` }}
              ></div>
            </div>
          </div>

          {/* 2-Attempt Strike Rule Display */}
          <div className="border-l border-slate-800 pl-3.5 flex flex-col items-center shrink-0">
            <div className="text-[9px] font-mono text-slate-400">ESCAPE CHANCES</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                  hackerStrikes >= 1
                    ? 'bg-red-950 border border-red-500 text-red-400'
                    : 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                }`}
              >
                {hackerStrikes >= 1 ? '✕' : '1'}
              </span>
              <span
                className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                  hackerStrikes >= 2
                    ? 'bg-red-950 border border-red-600 text-red-400'
                    : hackerStrikes === 1
                    ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse'
                    : 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                }`}
              >
                {hackerStrikes >= 2 ? '✕' : '2'}
              </span>
            </div>
            <span
              className={`text-[8px] font-mono mt-0.5 font-bold ${
                hackerStrikes === 0
                  ? 'text-emerald-400'
                  : hackerStrikes === 1
                  ? 'text-amber-400 animate-pulse'
                  : 'text-red-400'
              }`}
            >
              {hackerStrikes === 0
                ? '2 ATTEMPTS LEFT'
                : hackerStrikes === 1
                ? 'LAST CHANCE (1/2)!'
                : 'LOCKED UP!'}
            </span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT: Pause / Audio toggle */}
      <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-2">
        <button
          onClick={toggleSound}
          className="p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition shadow-lg"
          title="Toggle Mute"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
        <button
          onClick={onPause}
          className="px-3.5 py-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 hover:text-white transition shadow-lg"
        >
          PAUSE [ESC]
        </button>
      </div>

      {/* CENTER CROSSHAIR */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`relative transition-all duration-150 flex items-center justify-center ${
            focusedInteractive ? 'scale-125' : 'scale-100'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              focusedInteractive ? 'bg-cyan-400 ring-4 ring-cyan-500/40' : 'bg-white/70'
            }`}
          ></div>
          {focusedInteractive && (
            <div className="absolute w-8 h-8 border border-cyan-400/60 rounded-full animate-ping pointer-events-none"></div>
          )}
        </div>
      </div>

      {/* CONTEXTUAL INTERACTION PROMPT */}
      {focusedInteractive && (
        <div className="absolute top-[56%] left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-4 py-2 bg-slate-950/90 border border-cyan-400 rounded-xl shadow-2xl font-mono text-xs font-bold text-cyan-300 flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-cyan-500 text-slate-950 rounded font-black">E</span>
            <span>{focusedInteractive.prompt.replace('[E]', '').trim()}</span>
          </div>
        </div>
      )}

      {/* BANNER NOTIFICATION TOAST */}
      {bannerMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none transition-all">
          <div
            className={`px-5 py-2.5 rounded-xl border font-mono text-xs font-bold shadow-2xl flex items-center gap-2.5 ${
              bannerMessage.type === 'warning'
                ? 'bg-red-950/90 border-red-500 text-red-300 shadow-red-950/50'
                : bannerMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-emerald-950/50'
                : 'bg-cyan-950/90 border-cyan-500 text-cyan-300 shadow-cyan-950/50'
            }`}
          >
            <span>{bannerMessage.text}</span>
          </div>
        </div>
      )}

      {/* BOTTOM LEFT: Quick Actions */}
      <div className="absolute bottom-6 left-6 pointer-events-auto flex items-center gap-2.5">
        {/* Flashlight toggle */}
        <button
          onClick={onToggleFlashlight}
          className={`px-3 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs transition shadow-lg ${
            isFlashlightOn
              ? 'bg-amber-950/80 border-amber-400 text-amber-300'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Flashlight [F]"
        >
          <Flashlight className="w-4 h-4" />
          <span>[F] LIGHT: {isFlashlightOn ? 'ON' : 'OFF'}</span>
        </button>

        {/* Inventory button */}
        <button
          onClick={onOpenInventory}
          className="px-3 py-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 hover:text-white transition shadow-lg"
        >
          [TAB] INVENTORY
        </button>

        {/* EMP Stun Disrupter Quick Trigger */}
        {hasEMP && (
          <button
            onClick={onUseEMP}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-1.5 animate-pulse"
          >
            <Zap className="w-4 h-4" />
            <span>USE EMP STUN</span>
          </button>
        )}
      </div>

      {/* BOTTOM CENTER: Sleek Collapsible Controls Dock (per Three.js skill layout) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center">
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="px-2.5 py-0.5 mb-1 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition"
        >
          {isDockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{isDockCollapsed ? 'CONTROLS' : 'HIDE'}</span>
        </button>

        {!isDockCollapsed && (
          <div className="px-4 py-2 bg-slate-950/90 border border-slate-800 rounded-xl shadow-xl flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <div>
              <span className="text-white font-bold">WASD</span> Move
            </div>
            <div>
              <span className="text-white font-bold">SHIFT</span> Sprint
            </div>
            <div>
              <span className="text-white font-bold">CTRL</span> Crouch
            </div>
            <div>
              <span className="text-white font-bold">E</span> Interact
            </div>
            <div>
              <span className="text-white font-bold">F</span> Flashlight
            </div>
            <div>
              <span className="text-white font-bold">M</span> Map
            </div>
            <div>
              <span className="text-white font-bold">TAB</span> Inventory
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
