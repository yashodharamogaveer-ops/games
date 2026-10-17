/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class TextureGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * High-tech floor tiles with seams and subtle bevel highlights
   */
  public static getFloorTexture(): THREE.CanvasTexture {
    const key = 'floor_tile';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base dark slate
    ctx.fillStyle = '#141821';
    ctx.fillRect(0, 0, size, size);

    // Grid panels
    const tiles = 4;
    const tileSize = size / tiles;
    for (let x = 0; x < tiles; x++) {
      for (let y = 0; y < tiles; y++) {
        const px = x * tileSize;
        const py = y * tileSize;

        // Subtle gradient on each tile
        const grad = ctx.createLinearGradient(px, py, px + tileSize, py + tileSize);
        grad.addColorStop(0, '#1c2230');
        grad.addColorStop(1, '#11151e');
        ctx.fillStyle = grad;
        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);

        // Corner screw marks
        ctx.fillStyle = '#0a0d14';
        const inset = 8;
        ctx.beginPath();
        ctx.arc(px + inset, py + inset, 2, 0, Math.PI * 2);
        ctx.arc(px + tileSize - inset, py + inset, 2, 0, Math.PI * 2);
        ctx.arc(px + inset, py + tileSize - inset, 2, 0, Math.PI * 2);
        ctx.arc(px + tileSize - inset, py + tileSize - inset, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * High-tech wall panel texture
   */
  public static getWallTexture(tint: 'neutral' | 'blue' | 'dark' = 'neutral'): THREE.CanvasTexture {
    const key = `wall_${tint}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const bgMap = {
      neutral: '#1a1f2c',
      blue: '#0d192b',
      dark: '#101319',
    };

    ctx.fillStyle = bgMap[tint];
    ctx.fillRect(0, 0, size, size);

    // Horizontal structural seam
    ctx.fillStyle = '#080b10';
    ctx.fillRect(0, 120, size, 4);
    ctx.fillRect(0, 380, size, 4);

    // Accent conduit panel in center
    ctx.fillStyle = '#22293a';
    ctx.fillRect(40, 140, size - 80, 220);
    ctx.strokeStyle = '#2d374d';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 140, size - 80, 220);

    // Vertical line patterns
    ctx.strokeStyle = '#181e2b';
    ctx.lineWidth = 2;
    for (let x = 60; x < size - 60; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x, 350);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Server rack face texture with blinking lights and vents
   */
  public static getServerRackTexture(): THREE.CanvasTexture {
    const key = 'server_rack';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const width = 256;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Dark chassis
    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(0, 0, width, height);

    // Individual rack units (1U - 2U)
    const uCount = 12;
    const uHeight = height / uCount;

    for (let i = 0; i < uCount; i++) {
      const y = i * uHeight;
      ctx.fillStyle = i % 2 === 0 ? '#151b24' : '#12161f';
      ctx.fillRect(4, y + 2, width - 8, uHeight - 4);

      // Vent slats
      ctx.fillStyle = '#07090c';
      for (let vy = y + 8; vy < y + uHeight - 8; vy += 5) {
        ctx.fillRect(16, vy, 140, 2);
      }

      // LED indicator arrays (Cyan, Green, Amber, Blue)
      const colors = ['#00ffcc', '#00e5ff', '#3b82f6', '#10b981', '#f59e0b'];
      for (let led = 0; led < 6; led++) {
        const lx = width - 70 + (led % 3) * 16;
        const ly = y + 10 + Math.floor(led / 3) * 12;
        const color = colors[(i + led) % colors.length];

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Unit handle
      ctx.fillStyle = '#475569';
      ctx.fillRect(width - 18, y + 6, 4, uHeight - 12);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Digital monitor screen texture with cyber UI
   */
  public static getMonitorScreenTexture(label: string = 'SYSTEM ACTIVE', alert = false): THREE.CanvasTexture {
    const key = `screen_${label}_${alert}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Dark cyber background
    ctx.fillStyle = alert ? '#1a0505' : '#031018';
    ctx.fillRect(0, 0, width, height);

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 2);
    }

    // Border header
    const primaryColor = alert ? '#ef4444' : '#00e5ff';
    ctx.fillStyle = primaryColor;
    ctx.fillRect(10, 10, width - 20, 24);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(alert ? '!! SECURITY BREACH !!' : 'SEC_VILLA // SURVEILLANCE_NODE', 16, 27);

    // Main status text
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(label, 20, 75);

    // Decorative telemetry curves
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 130);
    for (let x = 20; x < width - 20; x += 15) {
      const y = 130 + Math.sin(x * 0.08) * 20 + (Math.random() * 10 - 5);
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Secondary data readouts
    ctx.font = '12px monospace';
    ctx.fillStyle = alert ? '#fca5a5' : '#93c5fd';
    ctx.fillText(`ENCRYPTION: AES-256-GCM`, 20, 180);
    ctx.fillText(`PORT 4432 // AI_SENTINEL_ACTIVE`, 20, 200);
    ctx.fillText(`STATUS: MONITORED / LOCKDOWN ENFORCED`, 20, 220);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Procedural Door Label texture with letter (A, B, C, D, E, F, EXIT, BEDROOM)
   */
  public static getDoorPanelTexture(doorLabel: string, isLocked = true): THREE.CanvasTexture {
    const key = `door_${doorLabel}_${isLocked}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const width = 256;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Steel door base
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#232936');
    grad.addColorStop(0.5, '#2e3747');
    grad.addColorStop(1, '#1c212c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Frame border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Center display plaque
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(30, 80, width - 60, 100);
    ctx.strokeStyle = isLocked ? '#ef4444' : '#10b981';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 80, width - 60, 100);

    // Large Door Label
    ctx.fillStyle = isLocked ? '#ef4444' : '#10b981';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(doorLabel, width / 2, 130);

    // Status label
    ctx.font = 'bold 14px monospace';
    ctx.fillText(isLocked ? 'LOCKED // RESTRICTED' : 'UNLOCKED // CLEAR', width / 2, 160);

    // Reinforced hazard stripes at bottom
    const stripeH = 40;
    const stripeY = height - 70;
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(20, stripeY, width - 40, stripeH);

    ctx.fillStyle = isLocked ? '#eab308' : '#10b981';
    for (let sx = 20; sx < width - 40; sx += 20) {
      ctx.beginPath();
      ctx.moveTo(sx, stripeY);
      ctx.lineTo(sx + 10, stripeY);
      ctx.lineTo(sx + 20, stripeY + stripeH);
      ctx.lineTo(sx + 10, stripeY + stripeH);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy handle bar plate
    ctx.fillStyle = '#64748b';
    ctx.fillRect(width - 55, height / 2 - 40, 20, 80);
    ctx.fillStyle = '#334155';
    ctx.fillRect(width - 50, height / 2 - 35, 10, 70);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  /**
   * Secret map parchment texture found in bedroom hidden drawer
   */
  public static getMapPaperTexture(): THREE.CanvasTexture {
    const key = 'map_paper';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Blueprint deep blue
    ctx.fillStyle = '#0b213f';
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    // Blueprint title
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('VILLA ESCAPE BLUEPRINT', 30, 45);
    ctx.font = '12px monospace';
    ctx.fillText('PROPERTY OF DR. VANCE // CONFIDENTIAL', 30, 68);

    // Schematic boxes
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    // Central hall
    ctx.strokeRect(180, 180, 150, 150);
    ctx.strokeText('SECURITY HALL', 200, 260);

    // Compass rose
    ctx.font = '14px monospace';
    ctx.fillText('N ▲', 460, 45);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }
}
