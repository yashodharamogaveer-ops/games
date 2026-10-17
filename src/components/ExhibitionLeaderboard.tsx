/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../game/types.ts';
import { Trophy, Medal, X, Trash2 } from 'lucide-react';

interface ExhibitionLeaderboardProps {
  onClose: () => void;
}

export const ExhibitionLeaderboard: React.FC<ExhibitionLeaderboardProps> = ({
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    try {
      const data = localStorage.getItem('hackers_trap_leaderboard');
      if (data) {
        setEntries(JSON.parse(data));
      } else {
        // Sample starter exhibition entries
        const initialSample: LeaderboardEntry[] = [
          {
            id: '1',
            playerName: 'CipherMaster',
            timeSeconds: 142,
            difficulty: 'normal',
            puzzlesSolved: 5,
            captures: 0,
            score: 18400,
            date: 'Today',
          },
          {
            id: '2',
            playerName: 'ByteRunner',
            timeSeconds: 185,
            difficulty: 'normal',
            puzzlesSolved: 4,
            captures: 1,
            score: 14200,
            date: 'Today',
          },
          {
            id: '3',
            playerName: 'TechNovice',
            timeSeconds: 210,
            difficulty: 'easy',
            puzzlesSolved: 4,
            captures: 2,
            score: 9500,
            date: 'Today',
          },
        ];
        setEntries(initialSample);
        localStorage.setItem('hackers_trap_leaderboard', JSON.stringify(initialSample));
      }
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all local exhibition leaderboard scores?')) {
      localStorage.removeItem('hackers_trap_leaderboard');
      setEntries([]);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-sm font-bold tracking-wider text-cyan-400">
              COLLEGE IT EXHIBITION LEADERBOARD
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="text-xs text-slate-400 font-sans">
            Top scores from exhibition participants. Scores are computed from time elapsed,
            number of puzzles solved, and stealth efficiency.
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">PLAYER</th>
                  <th className="py-3 px-4">TIME</th>
                  <th className="py-3 px-4">SOLVED</th>
                  <th className="py-3 px-4">DIFF</th>
                  <th className="py-3 px-4 text-right">SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No records logged yet. Be the first to escape!
                    </td>
                  </tr>
                ) : (
                  entries.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={idx === 0 ? 'bg-amber-950/20 text-amber-200' : 'text-slate-300 hover:bg-slate-900/40'}
                    >
                      <td className="py-3 px-4 font-bold flex items-center gap-1.5">
                        {idx === 0 ? (
                          <Medal className="w-4 h-4 text-amber-400" />
                        ) : idx === 1 ? (
                          <Medal className="w-4 h-4 text-slate-300" />
                        ) : idx === 2 ? (
                          <Medal className="w-4 h-4 text-amber-600" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-white truncate max-w-[140px]">
                        {item.playerName}
                      </td>
                      <td className="py-3 px-4 text-cyan-300">{formatTime(item.timeSeconds)}</td>
                      <td className="py-3 px-4">{item.puzzlesSolved}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                            item.difficulty === 'normal'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {item.score.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-t border-slate-800">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-red-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Leaderboard</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
