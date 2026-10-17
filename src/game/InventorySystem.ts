/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryItem } from './types.ts';

export class InventorySystem {
  private static instance: InventorySystem | null = null;
  private items: Map<string, InventoryItem> = new Map();
  private hasAcquiredMap: boolean = false;

  private constructor() {
    this.reset();
  }

  public static getInstance(): InventorySystem {
    if (!InventorySystem.instance) {
      InventorySystem.instance = new InventorySystem();
    }
    return InventorySystem.instance;
  }

  public reset() {
    this.items.clear();
    this.hasAcquiredMap = false;
  }

  public addItem(item: InventoryItem): boolean {
    if (this.items.has(item.id)) return false;
    this.items.set(item.id, item);
    if (item.id === 'item_escape_map') {
      this.hasAcquiredMap = true;
    }
    return true;
  }

  public removeItem(itemId: string): boolean {
    return this.items.delete(itemId);
  }

  public hasItem(itemId: string): boolean {
    return this.items.has(itemId);
  }

  public getItem(itemId: string): InventoryItem | undefined {
    return this.items.get(itemId);
  }

  public getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  public isMapAcquired(): boolean {
    return this.hasAcquiredMap;
  }

  public setMapAcquired(acquired: boolean) {
    this.hasAcquiredMap = acquired;
  }
}
