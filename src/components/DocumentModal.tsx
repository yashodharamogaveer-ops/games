/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, FileText } from 'lucide-react';

interface DocumentModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  title,
  content,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg bg-slate-950 border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="font-mono text-xs font-bold tracking-wider text-purple-300 uppercase">
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
            {content}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-lg transition"
            >
              CLOSE LOG [ESC]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
