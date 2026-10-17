/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export type RoomId =
  | 'bedroom'
  | 'security_hall'
  | 'surveillance_room'
  | 'storage_room'
  | 'laboratory'
  | 'server_room'
  | 'basement_passage'
  | 'outer_garden';

export type DoorId =
  | 'door_bedroom'
  | 'door_a'
  | 'door_b'
  | 'door_c'
  | 'door_d'
  | 'door_e'
  | 'door_f'
  | 'door_exit';

export type HackerState =
  | 'PATROL'
  | 'MONITOR'
  | 'SUSPICIOUS'
  | 'INVESTIGATE'
  | 'CHASE'
  | 'CAPTURE';

export interface RoomDefinition {
  id: RoomId;
  name: string;
  floor: number;
  description: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  color: string;
  connectedDoors: DoorId[];
}

export type DoorLockType =
  | 'number_keypad'
  | 'logic_riddle'
  | 'circuit_memory'
  | 'keycard'
  | 'trap_switch'
  | 'master_override'
  | 'unlocked';

export interface DoorDefinition {
  id: DoorId;
  label: string;
  name: string;
  fromRoom: RoomId;
  toRoom: RoomId;
  lockType: DoorLockType;
  position: [number, number, number];
  rotationY: number; // in radians
  isOpen: boolean;
  isLocked: boolean;
  requiredItemId?: string;
  puzzleId?: string;
  statusText?: string;
}

export type PuzzleType =
  | 'arithmetic_sequence'
  | 'cyber_riddle'
  | 'memory_sequence'
  | 'binary_conversion'
  | 'logic_gates';

export interface PuzzleDefinition {
  id: string;
  doorId?: DoorId;
  terminalId?: string;
  type: PuzzleType;
  title: string;
  description: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  hint: string;
  isSolved: boolean;
  category: string;
  sequenceColors?: string[]; // for memory sequence
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'key' | 'document' | 'tool' | 'electronics';
  content?: string; // If document or note
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  timeSeconds: number;
  difficulty: 'easy' | 'normal';
  puzzlesSolved: number;
  captures: number;
  score: number;
  date: string;
}

export interface GameSettings {
  mouseSensitivity: number; // 0.5 to 3.0
  masterVolume: number; // 0.0 to 1.0
  mapPosition: 'right' | 'left';
  difficulty: 'easy' | 'normal';
  challengeTimeLimit: number; // 0 = unlimited, 180 = 3 mins, 300 = 5 mins
  flashlightEnabled: boolean;
}

export interface InteractiveObject {
  id: string;
  name: string;
  prompt: string;
  position: [number, number, number];
  distance?: number;
  type: 'door' | 'terminal' | 'item' | 'note' | 'compartment';
  targetId: string;
}

export interface LaserTripwire {
  id: string;
  room: RoomId;
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  beamY: number; // e.g. 1.25m
  isTriggered: boolean;
  beamMesh: THREE.Mesh;
}

export type LayoutVariant = 0 | 1 | 2;

export interface LayoutInfo {
  variant: LayoutVariant;
  name: string;
  description: string;
  doorAssignments: {
    door_a: { toRoom: RoomId; name: string };
    door_b: { toRoom: RoomId; name: string };
    door_c: { toRoom: RoomId; name: string };
    door_d: { toRoom: RoomId; name: string };
  };
}
