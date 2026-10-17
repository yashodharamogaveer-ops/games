/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DoorManager } from '../game/DoorManager.ts';
import { MapSystem } from '../game/MapSystem.ts';
import { LevelGenerator } from '../game/LevelGenerator.ts';
import { RoomId } from '../game/types.ts';
import { Maximize2, Minimize2, EyeOff, Compass } from 'lucide-react';

interface MapHUDProps {
  playerPos: [number, number, number];
  playerYaw: number;
  currentRoom: RoomId;
  hackerPos?: [number, number, number];
  hackerState?: string;
  positionSide?: 'right' | 'left';
}

export const MapHUD: React.FC<MapHUDProps> = ({
  playerPos,
  playerYaw,
  currentRoom,
  hackerPos,
  hackerState,
  positionSide = 'right',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mapSystem = MapSystem.getInstance();

  if (!mapSystem.isUnlocked() || !mapSystem.isVisible()) {
    return null;
  }

  // World coordinates mapping to SVG coordinates
  // World bounds: X: [-24, 24], Z: [-36, 26]
  // SVG viewBox: 0, 0, 480, 620
  const worldToSvg = (wx: number, wz: number) => {
    const minX = -24;
    const maxX = 24;
    const minZ = -36;
    const maxZ = 26;

    const sx = ((wx - minX) / (maxX - minX)) * 440 + 20;
    const sy = ((wz - minZ) / (maxZ - minZ)) * 580 + 20;
    return { x: sx, y: sy };
  };

  const pSvg = worldToSvg(playerPos[0], playerPos[2]);
  const hSvg = hackerPos ? worldToSvg(hackerPos[0], hackerPos[2]) : null;

  // Door states
  const doors = DoorManager.getInstance().getAllDoorDefinitions();

  // Dynamic Room List reflecting the current layout variant
  const roomsList = LevelGenerator.getRoomDefinitions(LevelGenerator.currentVariant).map((r) => ({
    id: r.id,
    name: r.name.toUpperCase().replace(' QUARTERS', '').replace(' ATRIUM', '').replace(' BUNKER', '').replace(' VAULT', '').replace(' TUNNEL', '').replace(' GATE', ''),
    bounds: r.bounds,
    color: r.color,
  }));

  return (
    <div
      className={`fixed z-30 transition-all select-none ${
        isExpanded
          ? 'inset-6 md:inset-16 bg-slate-950/95 border-2 border-cyan-500/50 shadow-2xl rounded-2xl flex flex-col p-6'
          : `bottom-6 ${positionSide === 'right' ? 'right-6' : 'left-6'} w-64 md:w-80 bg-slate-950/90 border border-cyan-500/40 rounded-xl shadow-xl p-3`
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-900/60 text-xs">
        <div className="flex items-center gap-1.5 font-mono font-bold text-cyan-400">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>VILLA ESCAPE BLUEPRINT</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize' : 'Expand Blueprint'}
            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => mapSystem.toggleVisibility()}
            title="Hide Map [M]"
            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Graphical SVG Floor Plan */}
      <div className="relative flex-1 flex items-center justify-center bg-slate-900/70 rounded-lg overflow-hidden border border-slate-800">
        <svg
          viewBox="0 0 480 620"
          className="w-full h-full max-h-[75vh]"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0, 229, 255, 0.15))' }}
        >
          {/* Subtle blueprint grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(14, 165, 233, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Rooms */}
          {roomsList.map((r) => {
            const tl = worldToSvg(r.bounds.minX, r.bounds.minZ);
            const br = worldToSvg(r.bounds.maxX, r.bounds.maxZ);
            const w = br.x - tl.x;
            const h = br.y - tl.y;
            const isDiscovered = mapSystem.isRoomDiscovered(r.id as RoomId);
            const isCurrent = currentRoom === r.id;

            return (
              <g key={r.id}>
                <rect
                  x={tl.x}
                  y={tl.y}
                  width={w}
                  height={h}
                  fill={isDiscovered ? (isCurrent ? 'rgba(6, 182, 212, 0.22)' : 'rgba(30, 41, 59, 0.65)') : 'rgba(15, 23, 42, 0.95)'}
                  stroke={isDiscovered ? (isCurrent ? '#00e5ff' : '#475569') : '#1e293b'}
                  strokeWidth={isCurrent ? '2.5' : '1.5'}
                  rx="4"
                />
                {isDiscovered ? (
                  <text
                    x={tl.x + w / 2}
                    y={tl.y + h / 2}
                    fill={isCurrent ? '#38bdf8' : '#94a3b8'}
                    fontSize={isExpanded ? '11' : '9'}
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {r.name}
                  </text>
                ) : (
                  <text
                    x={tl.x + w / 2}
                    y={tl.y + h / 2}
                    fill="#334155"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    [LOCKED // ?]
                  </text>
                )}
              </g>
            );
          })}

          {/* Doors */}
          {doors.map((d) => {
            const dSvg = worldToSvg(d.position[0], d.position[2]);
            const isUnlocked = !d.isLocked;

            return (
              <g key={d.id} transform={`translate(${dSvg.x}, ${dSvg.y})`}>
                <circle
                  r={isExpanded ? 7 : 5.5}
                  fill={isUnlocked ? '#10b981' : '#ef4444'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                <text
                  y="3"
                  fill="#ffffff"
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {d.label.replace('DOOR ', '')}
                </text>
              </g>
            );
          })}

          {/* Hacker Blip (Red) */}
          {hSvg && (
            <g transform={`translate(${hSvg.x}, ${hSvg.y})`}>
              <circle r="7" fill="#ef4444" opacity="0.85" />
              <circle r="12" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
              <text y="-9" fill="#f87171" fontSize="8" fontFamily="monospace" textAnchor="middle">
                HACKER
              </text>
            </g>
          )}

          {/* Player Marker (Bright Green with Direction Cone) */}
          <g transform={`translate(${pSvg.x}, ${pSvg.y})`}>
            {/* Field of view cone */}
            <g transform={`rotate(${(playerYaw * 180) / Math.PI + 180})`}>
              <path
                d="M 0 0 L -14 -32 L 14 -32 Z"
                fill="rgba(34, 197, 94, 0.28)"
                stroke="rgba(34, 197, 94, 0.6)"
                strokeWidth="1"
              />
            </g>
            {/* Player Center Dot */}
            <circle r="6" fill="#22c55e" stroke="#052e16" strokeWidth="2" />
            <circle r="2" fill="#ffffff" />
          </g>
        </svg>

        {/* Floor & Room indicator tag */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/90 border border-slate-700/80 rounded text-[10px] font-mono text-cyan-300">
          ROOM: <span className="text-white font-bold">{currentRoom.toUpperCase()}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>YOU</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span>LOCKED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
          <span>CLEARED</span>
        </div>
        <span className="text-slate-500">[M] Toggle</span>
      </div>
    </div>
  );
};
