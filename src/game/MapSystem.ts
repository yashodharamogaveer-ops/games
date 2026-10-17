/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomId } from './types.ts';

export interface MapRoomState {
  id: RoomId;
  name: string;
  isDiscovered: boolean;
  isCurrent: boolean;
}

export class MapSystem {
  private static instance: MapSystem | null = null;
  private discoveredRooms: Set<RoomId> = new Set(['bedroom']); // Starting room is known
  private isMapUnlocked: boolean = false;
  private isMapVisible: boolean = true;
  private isExpanded: boolean = false;

  private constructor() {}

  public static getInstance(): MapSystem {
    if (!MapSystem.instance) {
      MapSystem.instance = new MapSystem();
    }
    return MapSystem.instance;
  }

  public reset() {
    this.discoveredRooms.clear();
    this.discoveredRooms.add('bedroom');
    this.isMapUnlocked = false;
    this.isExpanded = false;
  }

  public unlockMap() {
    this.isMapUnlocked = true;
    this.isMapVisible = true;
  }

  public isUnlocked(): boolean {
    return this.isMapUnlocked;
  }

  public toggleVisibility() {
    if (!this.isMapUnlocked) return;
    this.isMapVisible = !this.isMapVisible;
  }

  public isVisible(): boolean {
    return this.isMapVisible && this.isMapUnlocked;
  }

  public toggleExpanded() {
    if (!this.isMapUnlocked) return;
    this.isExpanded = !this.isExpanded;
  }

  public isMapExpanded(): boolean {
    return this.isExpanded;
  }

  public setExpanded(expanded: boolean) {
    this.isExpanded = expanded;
  }

  public discoverRoom(roomId: RoomId) {
    this.discoveredRooms.add(roomId);
  }

  public isRoomDiscovered(roomId: RoomId): boolean {
    return this.discoveredRooms.has(roomId);
  }

  public getAllDiscoveredRooms(): RoomId[] {
    return Array.from(this.discoveredRooms);
  }
}
