/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, X, Shield, Key, Compass, Skull, Eye } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-sm font-bold tracking-wider text-cyan-400">
              OPERATIONAL BRIEFING & CONTROLS
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
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 font-sans text-xs sm:text-sm">
          {/* Mission Overview */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4" /> THE HOSTAGE SITUATION
            </h3>
            <p className="text-slate-300 leading-relaxed">
              You awake trapped in a fortified cyberpunk villa owned by a master hacker. Automated
              surveillance cameras, security terminals, and a roaming cybernetic hacker guard the
              compound. Your only chance to escape is to find the hidden blueprint map, override the
              six security doors, and reach the outer perimeter laser gate.
            </p>
          </div>

          {/* Controls Table */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
              INPUT CONTROLS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">W, A, S, D</span>
                <span className="text-slate-400 text-[11px]">First-Person Movement</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">MOUSE</span>
                <span className="text-slate-400 text-[11px]">Look & Aim Camera</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">E KEY</span>
                <span className="text-slate-400 text-[11px]">Interact / Hack Door</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">SHIFT</span>
                <span className="text-slate-400 text-[11px]">Sprint (Loud!)</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">CTRL</span>
                <span className="text-slate-400 text-[11px]">Crouch (Silent Stealth)</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">F KEY</span>
                <span className="text-slate-400 text-[11px]">Toggle Flashlight</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">M KEY</span>
                <span className="text-slate-400 text-[11px]">Toggle Escape Map</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">TAB KEY</span>
                <span className="text-slate-400 text-[11px]">Open Inventory</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-cyan-400 font-bold block">ESC KEY</span>
                <span className="text-slate-400 text-[11px]">Pause / Release Pointer</span>
              </div>
            </div>
          </div>

          {/* Six Doors System */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <h3 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" /> THE SIX-DOOR DECISION ATRIUM
            </h3>
            <p className="text-xs text-slate-300">
              The grand security hall contains six physically interactive 3D doors (A through F).
              Each leads to different facilities with distinct locks and strategic challenges:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono list-disc list-inside">
              <li><strong className="text-slate-200">Door A:</strong> Sequence cipher keypad (Leads to Surveillance Room)</li>
              <li><strong className="text-slate-200">Door B:</strong> Cybersecurity riddle terminal (Leads to Storage Depot)</li>
              <li><strong className="text-slate-200">Door C:</strong> Optical relay memory pattern (Leads to Cyber Lab)</li>
              <li><strong className="text-slate-200">Door D:</strong> RFID reader (Requires Alpha Keycard from Storage)</li>
              <li><strong className="text-slate-200">Door E:</strong> Alarmed Trap Vault (Alerts hacker, but yields Prototype EMP tool!)</li>
              <li><strong className="text-slate-200">Door F:</strong> Master Airlock (Requires 4-digit code found in Server/Lab logs)</li>
            </ul>
          </div>

          {/* Escape Map & Stealth Warning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4" /> ESCAPE MAP HUD
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Initially you have no map! Locate the blue glowing blueprint inside the starting
                bedroom desk drawer to unlock the real-time right-hand navigation HUD.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-red-900/40 rounded-xl space-y-2">
              <h3 className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Skull className="w-4 h-4" /> HACKER AI THREAT
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Wrong password attempts sound an alarm and summon the hacker. Crouch to sneak past
                corridors. If captured, you restart in the bedroom!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 bg-slate-900/60 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20"
          >
            I UNDERSTAND // RETURN TO GAME
          </button>
        </div>
      </div>
    </div>
  );
};
