/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PuzzleManager } from '../game/PuzzleManager.ts';
import { AudioManager } from '../game/AudioManager.ts';
import { ShieldAlert, X, HelpCircle, CheckCircle2 } from 'lucide-react';

interface PuzzleModalProps {
  puzzleId: string;
  onClose: () => void;
  onSolved: (puzzleId: string) => void;
  onFailed: (puzzleId: string) => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzleId,
  onClose,
  onSolved,
  onFailed,
}) => {
  const puzzle = PuzzleManager.getInstance().getPuzzle(puzzleId);
  const [inputAnswer, setInputAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'none' | 'success' | 'error'; message: string }>({
    type: 'none',
    message: '',
  });
  const [hint, setHint] = useState<string | null>(null);

  // Memory sequence state (for memory_sequence puzzle)
  const [memoryPlaybackIndex, setMemoryPlaybackIndex] = useState(-1);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);

  useEffect(() => {
    AudioManager.getInstance().playKeypadBeep();

    if (puzzle && puzzle.type === 'memory_sequence' && puzzle.sequenceColors) {
      playMemoryPattern(puzzle.sequenceColors);
    }
  }, [puzzleId]);

  const playMemoryPattern = (colors: string[]) => {
    setIsShowingSequence(true);
    setPlayerSequence([]);
    colors.forEach((col, idx) => {
      setTimeout(() => {
        setMemoryPlaybackIndex(idx);
        AudioManager.getInstance().playKeypadBeep();
      }, (idx + 1) * 700);
    });

    setTimeout(() => {
      setMemoryPlaybackIndex(-1);
      setIsShowingSequence(false);
    }, (colors.length + 1) * 700);
  };

  if (!puzzle) return null;

  const handleSubmit = (answerToSubmit?: string) => {
    const finalAnswer = answerToSubmit || selectedOption || inputAnswer;
    if (!finalAnswer) return;

    AudioManager.getInstance().playKeypadBeep();
    const result = PuzzleManager.getInstance().validateAnswer(puzzleId, finalAnswer);

    if (result.isCorrect) {
      setFeedback({ type: 'success', message: result.message });
      AudioManager.getInstance().playAccessGranted();
      setTimeout(() => {
        onSolved(puzzleId);
        onClose();
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: result.message });
      AudioManager.getInstance().playAccessDenied();
      if (result.hint) {
        setHint(result.hint);
      }
      if (result.alertTriggered) {
        onFailed(puzzleId);
      }
    }
  };

  const handleColorClick = (color: string) => {
    if (isShowingSequence) return;
    AudioManager.getInstance().playKeypadBeep();
    const newSeq = [...playerSequence, color];
    setPlayerSequence(newSeq);

    if (puzzle.sequenceColors) {
      const currentIdx = newSeq.length - 1;
      if (newSeq[currentIdx] !== puzzle.sequenceColors[currentIdx]) {
        // Wrong step!
        setFeedback({ type: 'error', message: 'HARMONIC SEQUENCE MISMATCH // ACCESS DENIED' });
        AudioManager.getInstance().playAccessDenied();
        onFailed(puzzleId);
        setTimeout(() => {
          setPlayerSequence([]);
          playMemoryPattern(puzzle.sequenceColors!);
        }, 1000);
        return;
      }

      if (newSeq.length === puzzle.sequenceColors.length) {
        // Full sequence matched!
        handleSubmit('MATCH_SEQUENCE');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div
        className={`w-full max-w-lg bg-slate-950 border-2 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
          feedback.type === 'error'
            ? 'border-red-500 shadow-red-950/50'
            : feedback.type === 'success'
            ? 'border-emerald-500 shadow-emerald-950/50'
            : 'border-cyan-500/50 shadow-cyan-950/30'
        }`}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
            <span className="font-mono text-xs font-bold tracking-wider text-cyan-400">
              {puzzle.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Category & Description */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 uppercase tracking-widest">
              <span>SECURITY PROTOCOL: {puzzle.category}</span>
            </div>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              {puzzle.description}
            </p>
          </div>

          {/* Question Box */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-cyan-300 text-sm shadow-inner">
            <div className="text-xs text-slate-500 mb-1">CHALLENGE STRING:</div>
            <div className="text-base text-cyan-200 font-bold whitespace-pre-wrap">
              {puzzle.question}
            </div>
          </div>

          {/* Memory Sequence Color Buttons */}
          {puzzle.type === 'memory_sequence' && puzzle.sequenceColors && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 text-center">
                {isShowingSequence ? 'WATCH FLASHING SEQUENCE...' : `REPEAT SEQUENCE (${playerSequence.length} / ${puzzle.sequenceColors.length}):`}
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                {['cyan', 'red', 'yellow', 'green'].map((col) => {
                  const isFlashing =
                    memoryPlaybackIndex >= 0 &&
                    puzzle.sequenceColors![memoryPlaybackIndex] === col;

                  const colorStyles: Record<string, string> = {
                    cyan: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
                    red: 'bg-red-500 hover:bg-red-400 text-white',
                    yellow: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
                    green: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
                  };

                  return (
                    <button
                      key={col}
                      onClick={() => handleColorClick(col)}
                      disabled={isShowingSequence}
                      className={`h-20 rounded-xl font-mono font-bold uppercase transition transform active:scale-95 shadow-lg border-2 ${
                        isFlashing
                          ? 'border-white scale-105 brightness-150 ring-4 ring-white/50'
                          : 'border-transparent'
                      } ${colorStyles[col]}`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Multiple Choice Options */}
          {puzzle.options && puzzle.options.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400">SELECT VERIFIED RESPONSE:</div>
              <div className="grid grid-cols-2 gap-2.5">
                {puzzle.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedOption(opt);
                      AudioManager.getInstance().playKeypadBeep();
                    }}
                    className={`py-3 px-4 text-left font-mono text-sm rounded-lg border transition ${
                      selectedOption === opt
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text/Number Input (if no options and not memory sequence) */}
          {(!puzzle.options || puzzle.options.length === 0) && puzzle.type !== 'memory_sequence' && (
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">ENTER VALUE / PASSCODE:</label>
              <input
                type="text"
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                placeholder="Type numeric or cipher answer..."
                autoFocus
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg font-mono text-base text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          )}

          {/* Feedback & Alert Display */}
          {feedback.type !== 'none' && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2.5 font-mono text-xs font-bold transition-all ${
                feedback.type === 'error'
                  ? 'bg-red-950/80 border border-red-500/80 text-red-400'
                  : 'bg-emerald-950/80 border border-emerald-500/80 text-emerald-400'
              }`}
            >
              {feedback.type === 'error' ? (
                <ShieldAlert className="w-5 h-5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Hint disclosure */}
          {hint && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg flex items-start gap-2.5 text-xs font-mono text-cyan-300">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-400">DIAGNOSTIC HINT: </span>
                {hint}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          {puzzle.type !== 'memory_sequence' && (
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition"
              >
                ABORT
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-mono font-bold text-xs rounded-lg transition shadow-lg shadow-cyan-500/20"
              >
                EXECUTE OVERRIDE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
