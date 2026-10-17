/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, CheckCircle, ArrowRight, Share2 } from 'lucide-react';
import { LeaderboardEntry } from '../game/types.ts';

interface VictoryModalProps {
  timeElapsed: number;
  puzzlesSolved: number;
  capturesCount: number;
  difficulty: 'easy' | 'normal';
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  timeElapsed,
  puzzlesSolved,
  capturesCount,
  difficulty,
  onPlayAgain,
  onViewLeaderboard,
}) => {
  const [nickname, setNickname] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Score calculation
  const timeBonus = Math.max(0, Math.floor(12000 - timeElapsed * 20));
  const puzzleBonus = puzzlesSolved * 1500;
  const capturePenalty = capturesCount * 1800;
  const difficultyMultiplier = difficulty === 'normal' ? 1.5 : 1.0;
  const finalScore = Math.max(500, Math.floor((timeBonus + puzzleBonus - capturePenalty) * difficultyMultiplier));

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    try {
      const existingStr = localStorage.getItem('hackers_trap_leaderboard') || '[]';
      const list: LeaderboardEntry[] = JSON.parse(existingStr);
      const newEntry: LeaderboardEntry = {
        id: Date.now().toString(),
        playerName: nickname.trim().slice(0, 16),
        timeSeconds: Math.round(timeElapsed),
        difficulty,
        puzzlesSolved,
        captures: capturesCount,
        score: finalScore,
        date: new Date().toLocaleDateString(),
      };
      list.push(newEntry);
      list.sort((a, b) => b.score - a.score);
      localStorage.setItem('hackers_trap_leaderboard', JSON.stringify(list.slice(0, 20)));
      setSubmitted(true);
    } catch {
      // LocalStorage fallback
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 select-none animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-950 border-2 border-emerald-500 rounded-2xl shadow-2xl shadow-emerald-950/80 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="font-mono text-2xl font-black text-emerald-400 tracking-wider">
            MISSION ACCOMPLISHED
          </h2>
          <p className="text-xs font-mono text-slate-400">
            YOU BYPASSED THE SECURITY GRID AND ESCAPED THE COMPOUND!
          </p>
        </div>

        {/* Score & Run breakdown */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 font-mono">
          <div className="grid grid-cols-3 gap-2 text-center text-xs border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] text-slate-500">ESCAPE TIME</div>
              <div className="text-sm font-bold text-white">{formatTime(timeElapsed)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">PUZZLES SOLVED</div>
              <div className="text-sm font-bold text-cyan-400">{puzzlesSolved}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">CAPTURES</div>
              <div className="text-sm font-bold text-amber-400">{capturesCount}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <span className="text-slate-400">FINAL EXHIBITION SCORE:</span>
            <span className="text-xl font-bold text-emerald-400">
              {finalScore.toLocaleString()} PTS
            </span>
          </div>
        </div>

        {/* Leaderboard Submission */}
        {!submitted ? (
          <form onSubmit={handleSaveScore} className="space-y-3">
            <label className="block text-xs font-mono text-slate-400">
              ENTER YOUR EXHIBITION NICKNAME:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. CyberNinja"
                maxLength={16}
                required
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                SUBMIT SCORE
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs font-mono text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>SCORE RECORDED ON EXHIBITION LEADERBOARD!</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onViewLeaderboard}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs rounded-xl transition"
          >
            VIEW LEADERBOARD
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <span>PLAY AGAIN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
