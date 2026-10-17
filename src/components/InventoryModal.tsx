/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventorySystem } from '../game/InventorySystem.ts';
import { InventoryItem } from '../game/types.ts';
import { Key, Map, FileText, Zap, Cpu, X, ShieldAlert } from 'lucide-react';

interface InventoryModalProps {
  onClose: () => void;
  onUseEMP: () => void;
  onOpenDocument: (title: string, content: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  onClose,
  onUseEMP,
  onOpenDocument,
}) => {
  const inventory = InventorySystem.getInstance();
  const items = inventory.getAllItems();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(
    items.length > 0 ? items[0] : null
  );

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'map':
        return <Map className="w-6 h-6 text-cyan-400" />;
      case 'key':
        return <Key className="w-6 h-6 text-amber-400" />;
      case 'zap':
        return <Zap className="w-6 h-6 text-blue-400" />;
      case 'cpu':
        return <Cpu className="w-6 h-6 text-emerald-400" />;
      case 'file-text':
      default:
        return <FileText className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="font-mono text-sm font-bold tracking-wider text-cyan-400">
              EQUIPMENT & RECON LOGS [TAB]
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[320px]">
          {/* Items list */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 mb-2">
              COLLECTED ITEMS ({items.length} / 5):
            </div>

            {items.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 font-mono text-xs">
                NO ITEMS IN INVENTORY
                <br />
                Search the rooms to find keys, maps, and cyber equipment.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full p-3 flex items-center gap-3 rounded-xl border text-left transition ${
                      selectedItem?.id === item.id
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
                      {renderIcon(item.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs font-bold text-white truncate">
                        {item.name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 uppercase">
                        {item.category}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details inspection */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/40">
                    {renderIcon(selectedItem.icon)}
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-cyan-300">
                      {selectedItem.name}
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded">
                      CLASS: {selectedItem.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedItem.description}
                </p>

                {/* Document reading button */}
                {selectedItem.content && (
                  <button
                    onClick={() => {
                      onOpenDocument(selectedItem.name, selectedItem.content!);
                    }}
                    className="w-full py-2 px-3 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 rounded-lg font-mono text-xs text-purple-300 flex items-center justify-center gap-2 transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>INSPECT DECRYPTED CONTENTS</span>
                  </button>
                )}

                {/* EMP weapon activation */}
                {selectedItem.id === 'item_emp_device' && (
                  <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-blue-300 font-bold">
                      <ShieldAlert className="w-4 h-4 text-blue-400" />
                      <span>TACTICAL COUNTERMEASURE</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Detonates a localized electromagnetic pulse to disable the Hacker AI for 10
                      seconds.
                    </p>
                    <button
                      onClick={() => {
                        onUseEMP();
                        onClose();
                      }}
                      className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition shadow-lg shadow-blue-500/30"
                    >
                      DETONATE EMP DISRUPTER
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-xs">
                Select an item to view specifications
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 text-right">
              <span className="text-[10px] font-mono text-slate-500">
                Press [TAB] or [ESC] to return
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
