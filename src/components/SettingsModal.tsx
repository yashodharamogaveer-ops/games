/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings } from '../game/types.ts';
import { Settings, X, Volume2, MousePointer, Compass, Shield } from 'lucide-react';
import { AudioManager } from '../game/AudioManager.ts';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleChange = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
    if (partial.masterVolume !== undefined) {
      AudioManager.getInstance().setVolume(partial.masterVolume);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-sm font-bold tracking-wider text-cyan-400">
              GAME & EXHIBITION SETTINGS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mouse Sensitivity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-cyan-400" />
                <span>MOUSE LOOK SENSITIVITY</span>
              </span>
              <span className="text-cyan-400 font-bold">{settings.mouseSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={settings.mouseSensitivity}
              onChange={(e) => handleChange({ mouseSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800"
            />
          </div>

          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>AUDIO VOLUME</span>
              </span>
              <span className="text-cyan-400 font-bold">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => handleChange({ masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800"
            />
          </div>

          {/* Map HUD Position */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>MAP HUD DOCK POSITION</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange({ mapPosition: 'right' })}
                className={`py-2.5 px-4 rounded-xl border font-mono text-xs font-bold transition ${
                  settings.mapPosition === 'right'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                RIGHT SIDE (DEFAULT)
              </button>
              <button
                type="button"
                onClick={() => handleChange({ mapPosition: 'left' })}
                className={`py-2.5 px-4 rounded-xl border font-mono text-xs font-bold transition ${
                  settings.mapPosition === 'left'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                LEFT SIDE
              </button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>DIFFICULTY MODE</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange({ difficulty: 'easy' })}
                className={`p-3 rounded-xl border text-left font-mono transition ${
                  settings.difficulty === 'easy'
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">EASY (EXHIBITION)</div>
                <div className="text-[10px] text-slate-400">Slower hacker, casual pace</div>
              </button>
              <button
                type="button"
                onClick={() => handleChange({ difficulty: 'normal' })}
                className={`p-3 rounded-xl border text-left font-mono transition ${
                  settings.difficulty === 'normal'
                    ? 'bg-purple-950 border-purple-400 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">NORMAL (THRILLER)</div>
                <div className="text-[10px] text-slate-400">Active hacker patrol & chase</div>
              </button>
            </div>
          </div>

          {/* Exhibition Challenge Timer */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-300">EXHIBITION TIME CHALLENGE:</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'UNLIMITED', val: 0 },
                { label: '3 MINUTES', val: 180 },
                { label: '5 MINUTES', val: 300 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleChange({ challengeTimeLimit: opt.val })}
                  className={`py-2 rounded-xl border font-mono text-[11px] font-bold transition ${
                    settings.challengeTimeLimit === opt.val
                      ? 'bg-amber-950 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 bg-slate-900/60 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
