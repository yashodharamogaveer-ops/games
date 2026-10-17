/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { HackerTensionShader } from './HackerTensionShader.ts';
import { DoorManager } from './DoorManager.ts';
import { LevelGenerator } from './LevelGenerator.ts';
import { PlayerController } from './PlayerController.ts';
import { HackerAI } from './HackerAI.ts';
import { PuzzleManager } from './PuzzleManager.ts';
import { InventorySystem } from './InventorySystem.ts';
import { MapSystem } from './MapSystem.ts';
import { AudioManager } from './AudioManager.ts';
import { RoomId, InteractiveObject, GameSettings, LaserTripwire, LayoutVariant } from './types.ts';

export interface GameStateSnapshot {
  playerRoom: RoomId;
  playerPos: [number, number, number];
  playerYaw: number;
  hackerState: string;
  alertLevel: number;
  isMapUnlocked: boolean;
  focusedInteractive: InteractiveObject | null;
  currentObjective: string;
  hackerStrikes: number;
  layoutVariant: LayoutVariant;
  layoutName: string;
}

export class GameWorld {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public composer: EffectComposer;
  public renderPass: RenderPass;
  public tensionPass: ShaderPass;
  public doorManager: DoorManager;
  public playerController: PlayerController;
  public hackerAI: HackerAI;

  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isVictory: boolean = false;
  public isCaptured: boolean = false;

  public layoutVariant: LayoutVariant = 0;
  private currentThreatIntensity: number = 0.0;
  private heartbeatAudioTimer: number = 0.0;
  private levelColliders: THREE.Box3[] = [];
  private tripwires: LaserTripwire[] = [];

  private canvasContainer: HTMLElement;
  private animationFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();
  private mapPickupMesh: THREE.Mesh | null = null;
  private exitTriggerBox: THREE.Box3 | null = null;

  public currentRoom: RoomId = 'bedroom';
  public currentObjective: string = 'Search the bedroom for an escape route and the hidden blueprint map';
  public capturesCount: number = 0;
  public puzzlesSolvedCount: number = 0;
  public timeElapsed: number = 0;

  public onStateChange?: (state: GameStateSnapshot) => void;
  public onOpenPuzzle?: (puzzleId: string) => void;
  public onReadDocument?: (title: string, content: string) => void;
  public onBannerAlert?: (msg: string, type?: 'info' | 'warning' | 'success') => void;
  public onCaptured?: () => void;
  public onVictory?: () => void;

  private settings: GameSettings;

  constructor(canvasContainer: HTMLElement, settings: GameSettings) {
    this.canvasContainer = canvasContainer;
    this.settings = settings;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060910);
    this.scene.fog = new THREE.FogExp2(0x060910, 0.035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvasContainer.clientWidth / canvasContainer.clientHeight,
      0.1,
      100
    );

    // 3. Renderer with Three.js Skill PBR standards
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    canvasContainer.appendChild(this.renderer.domElement);

    // 3b. Post-Processing EffectComposer with HackerTensionShader
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.tensionPass = new ShaderPass(HackerTensionShader);
    this.composer.addPass(this.tensionPass);

    // 4. Studio Environment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Door Manager
    this.doorManager = DoorManager.getInstance();

    // 6. Level Construction with layoutVariant
    const levelData = LevelGenerator.buildWorld(this.scene, this.doorManager, this.layoutVariant);
    this.mapPickupMesh = levelData.mapPickupMesh;
    this.exitTriggerBox = levelData.exitTriggerBox;
    this.levelColliders = levelData.colliders;
    this.tripwires = levelData.tripwires;

    // 7. Player Controller
    this.playerController = new PlayerController(
      this.camera,
      this.renderer.domElement,
      this.doorManager,
      new THREE.Vector3(-4, 0, 20)
    );
    this.playerController.setColliders(levelData.colliders, levelData.interactives);
    this.playerController.setSensitivity(settings.mouseSensitivity);

    // 8. Hacker AI (Stationary at Server Room console until an alarm event is triggered)
    this.hackerAI = new HackerAI(this.scene);

    window.addEventListener('resize', this.onResize);
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();
    AudioManager.getInstance().startAmbient();
    this.animate();
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
    AudioManager.getInstance().stopAmbient();
  }

  public pause() {
    this.isPaused = true;
    this.playerController.unlockPointer();
  }

  public resume() {
    this.isPaused = false;
  }

  public restartRun(newSeed = Math.random()) {
    // 1. Advance to fresh layout variant and regenerate all dynamic questions
    this.layoutVariant = (Math.floor(Math.random() * 3)) as LayoutVariant;
    const layoutInfo = LevelGenerator.getLayoutInfo(this.layoutVariant);

    PuzzleManager.getInstance().generatePuzzles(newSeed);
    InventorySystem.getInstance().reset();
    MapSystem.getInstance().reset();

    // 2. Rebuild the 3D level geometry & doors for this layout
    const levelData = LevelGenerator.buildWorld(this.scene, this.doorManager, this.layoutVariant);
    this.mapPickupMesh = levelData.mapPickupMesh;
    this.exitTriggerBox = levelData.exitTriggerBox;
    this.levelColliders = levelData.colliders;
    this.tripwires = levelData.tripwires;

    // 3. Reset player controller colliders & position
    this.playerController.setColliders(levelData.colliders, levelData.interactives);
    this.playerController.reset(new THREE.Vector3(-4, 0, 20), 0);

    this.currentRoom = 'bedroom';
    this.currentObjective = 'Search the bedroom for an escape route and the hidden blueprint map';
    this.isVictory = false;
    this.isCaptured = false;

    // Reset map pickup mesh visibility
    if (this.mapPickupMesh) {
      this.mapPickupMesh.visible = true;
    }

    // Reset hacker AI to monitoring post at Server console
    this.hackerAI.reset(new THREE.Vector3(18, 0, 11));

    if (this.onBannerAlert) {
      this.onBannerAlert(
        `NEW RUN INITIALIZED: ${layoutInfo.name} // 2 ESCAPE CHANCES REMAINING`,
        'info'
      );
    }
  }

  public setSettings(settings: GameSettings) {
    this.settings = settings;
    this.playerController.setSensitivity(settings.mouseSensitivity);
    AudioManager.getInstance().setVolume(settings.masterVolume);
  }

  private onResize = () => {
    if (!this.canvasContainer) return;
    const width = this.canvasContainer.clientWidth;
    const height = this.canvasContainer.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  };

  public handleInteraction(): boolean {
    const focused = this.playerController.focusedInteractive;
    if (!focused) return false;

    // 1. Pick up Escape Map
    if (focused.id === 'pickup_map') {
      InventorySystem.getInstance().addItem({
        id: 'item_escape_map',
        name: "Hacker's Blueprint Escape Map",
        description: 'A detailed topological blueprint of the villa compound. Unlocks the dynamic navigation floor plan.',
        icon: 'map',
        category: 'tool',
      });
      MapSystem.getInstance().unlockMap();
      if (this.mapPickupMesh) this.mapPickupMesh.visible = false;
      AudioManager.getInstance().playMapPickup();
      if (this.onBannerAlert) {
        this.onBannerAlert('ESCAPE MAP ACQUIRED // NAVIGATION HUD UNLOCKED', 'success');
      }
      this.currentObjective = 'Use the security terminal or keypad to unlock the bedroom door';
      return true;
    }

    // 2. Pick up Alpha Keycard
    if (focused.id === 'pickup_alpha_keycard') {
      InventorySystem.getInstance().addItem({
        id: 'item_alpha_keycard',
        name: 'Alpha Security Keycard',
        description: 'An encrypted RFID badge granting authorization to Server Core Vault.',
        icon: 'key',
        category: 'key',
      });
      AudioManager.getInstance().playItemPickup();
      if (this.onBannerAlert) {
        this.onBannerAlert('COLLECTED: ALPHA SECURITY KEYCARD', 'info');
      }
      return true;
    }

    // 3. Pick up Lab USB Drive
    if (focused.id === 'pickup_lab_usb') {
      InventorySystem.getInstance().addItem({
        id: 'item_lab_usb',
        name: 'Decrypted Hacker USB Key',
        description: 'Contains decrypted security logs. Note reads: "Master airlock code suffix is derived from server core register."',
        icon: 'file-text',
        category: 'document',
        content: 'SYSTEM ARCHITECT LOG:\nThe Door F master airlock is guarded by a multi-part authentication passkey. Check the Server Room terminal to obtain the root encryption register, and Surveillance monitors for the camera logs.',
      });
      AudioManager.getInstance().playItemPickup();
      if (this.onBannerAlert) {
        this.onBannerAlert('COLLECTED: DECRYPTED HACKER USB DRIVE', 'info');
      }
      return true;
    }

    // 4. Pick up EMP Stun Tool
    if (focused.id === 'pickup_emp_device') {
      InventorySystem.getInstance().addItem({
        id: 'item_emp_device',
        name: 'Prototype EMP Stun Disrupter',
        description: 'An experimental electromagnetic burst device capable of temporarily stunning the Hacker AI for 10 seconds.',
        icon: 'zap',
        category: 'electronics',
      });
      AudioManager.getInstance().playItemPickup();
      if (this.onBannerAlert) {
        this.onBannerAlert('COLLECTED: PROTOTYPE EMP DISRUPTER', 'warning');
      }
      return true;
    }

    // 5. Pick up Garden Relay Fuse
    if (focused.id === 'pickup_garden_fuse') {
      InventorySystem.getInstance().addItem({
        id: 'item_garden_fuse',
        name: 'High-Voltage Gate Relay Fuse',
        description: 'A heavy industrial fuse required to bypass the high-voltage perimeter laser gate.',
        icon: 'cpu',
        category: 'electronics',
      });
      AudioManager.getInstance().playItemPickup();
      if (this.onBannerAlert) {
        this.onBannerAlert('COLLECTED: GATE RELAY FUSE', 'info');
      }
      return true;
    }

    // 6. Bedroom Note
    if (focused.id === 'note_bedroom') {
      if (this.onReadDocument) {
        this.onReadDocument(
          'HOSTAGE CONFINEMENT PROTOCOL',
          'CONFINEMENT LOG: Subject detained in Bedroom Quarters.\nDOOR OVERRIDE: Solvable via geometric progression on the door terminal.\nNOTE: Check the room for the forgotten escape map blueprint. The hacker stays at the command console unless an alarm event is triggered.'
        );
      }
      return true;
    }

    // 7. Emergency Villa Siren Console (Interactive Alarm Event!)
    if (focused.id === 'alarm_villa_emergency') {
      AudioManager.getInstance().playAlertSiren();
      this.hackerAI.dispatchToEvent(new THREE.Vector3(0, 0, 10), 'EMERGENCY VILLA SIREN');
      if (this.onBannerAlert) {
        this.onBannerAlert('🚨 ALARM EVENT: EMERGENCY CONSOLE TRIGGERED! HACKER DISPATCHED TO ATRIUM!', 'warning');
      }
      return true;
    }

    // 8. Surveillance Terminal
    if (focused.id === 'terminal_surveillance') {
      if (this.onReadDocument) {
        this.onReadDocument(
          'SURVEILLANCE NODE LOGS',
          'SURVEILLANCE FEED // ACTIVE\nCCTV 01: Hallway sensors operational.\nCCTV 02: Watch for red laser tripwires — crouching [CTRL] slips beneath them!\nSECURITY NOTE: Door F Master Airlock code requires the hex register from the Server Room terminal.'
        );
      }
      return true;
    }

    // 9. Server Terminal Puzzle
    if (focused.id === 'terminal_server') {
      if (this.onOpenPuzzle) {
        this.onOpenPuzzle('puzzle_server_terminal');
      }
      return true;
    }

    // 10. Exit Gate Terminal
    if (focused.id === 'terminal_exit_gate') {
      if (!InventorySystem.getInstance().hasItem('item_garden_fuse')) {
        AudioManager.getInstance().playAccessDenied();
        if (this.onBannerAlert) {
          this.onBannerAlert('POWER FAILURE: PERIMETER GATE REQUIRES GATE RELAY FUSE FROM BASEMENT', 'warning');
        }
        return true;
      }
      if (this.onOpenPuzzle) {
        this.onOpenPuzzle('puzzle_exit_gate');
      }
      return true;
    }

    // 11. Door Interactivity
    if (focused.type === 'door') {
      const doorId = focused.targetId as any;
      const doorDef = this.doorManager.getDoorDefinition(doorId);
      if (!doorDef) return false;

      if (!doorDef.isLocked) {
        return false;
      }

      // Check keycard requirement for Door D / keycard door
      if (doorDef.lockType === 'keycard' && doorDef.requiredItemId) {
        if (InventorySystem.getInstance().hasItem(doorDef.requiredItemId)) {
          this.doorManager.unlockAndOpen(doorId);
          this.puzzlesSolvedCount++;
          if (this.onBannerAlert) {
            this.onBannerAlert(`${doorDef.label} UNLOCKED WITH ALPHA KEYCARD`, 'success');
          }
          return true;
        } else {
          AudioManager.getInstance().playAccessDenied();
          if (this.onBannerAlert) {
            this.onBannerAlert('ACCESS DENIED // ALPHA KEYCARD REQUIRED (SEARCH CRATES OR LAB)', 'warning');
          }
          return true;
        }
      }

      // Check trap door E (ALARM EVENT: Vault E Intrusion)
      if (doorDef.lockType === 'trap_switch') {
        this.doorManager.unlockAndOpen(doorId);
        // Triggers alarm event and dispatches Hacker AI!
        this.hackerAI.dispatchToEvent(new THREE.Vector3(-4, 0, -2), 'RESTRICTED VAULT E INTRUSION');
        if (this.onBannerAlert) {
          this.onBannerAlert('🚨 ALARM EVENT: RESTRICTED VAULT E OPENED! HACKER DISPATCHED TO INTERCEPT!', 'warning');
        }
        return true;
      }

      // Open keypad / terminal puzzle
      if (doorDef.puzzleId && this.onOpenPuzzle) {
        this.onOpenPuzzle(doorDef.puzzleId);
        return true;
      }
    }

    return false;
  }

  public useEMP(): boolean {
    if (!InventorySystem.getInstance().hasItem('item_emp_device')) return false;
    InventorySystem.getInstance().removeItem('item_emp_device');
    this.hackerAI.stun(10);
    AudioManager.getInstance().playAlertSiren();
    if (this.onBannerAlert) {
      this.onBannerAlert('EMP ACTIVATED! HACKER AI NEUTRALIZED FOR 10 SECONDS!', 'success');
    }
    return true;
  }

  public onPuzzleSolved(puzzleId: string) {
    const puzzle = PuzzleManager.getInstance().getPuzzle(puzzleId);
    if (!puzzle) return;

    this.puzzlesSolvedCount++;

    if (puzzle.doorId) {
      this.doorManager.unlockAndOpen(puzzle.doorId);

      if (puzzle.doorId === 'door_bedroom') {
        this.currentObjective = 'Explore the Security Atrium and investigate the six doors';
      } else if (puzzle.doorId === 'door_exit') {
        // Disable perimeter laser beams
        this.scene.traverse((obj) => {
          if (obj.name === 'laserBeam') obj.visible = false;
        });
        this.currentObjective = 'Sprint through the open perimeter gate to reach the last exit!';
      }
    }

    if (this.onBannerAlert) {
      this.onBannerAlert(`AUTHENTICATION OVERRIDE: ${puzzle.title} SOLVED`, 'success');
    }
  }

  public onPuzzleFailed(puzzleId: string) {
    AudioManager.getInstance().playAccessDenied();
    const fails = PuzzleManager.getInstance().getFailedAttempts(puzzleId);

    if (fails >= 2) {
      // 2 failed attempts: ALARM EVENT - Hacker is dispatched!
      this.hackerAI.dispatchToEvent(this.playerController.position, 'TERMINAL 2-FAIL LOCKDOWN');
      if (this.onBannerAlert) {
        this.onBannerAlert(
          '🚨 ALARM EVENT: 2 FAILED PASSCODES! TERMINAL INTRUSION DETECTED — HACKER DISPATCHED!',
          'warning'
        );
      }
    } else {
      // 1st attempt: Free hint revealed, no hacker alert
      if (this.onBannerAlert) {
        this.onBannerAlert(
          'INCORRECT (ATTEMPT 1/2) - HINT UNLOCKED! RETRY ONCE MORE WITHOUT PENALTY',
          'info'
        );
      }
    }
  }

  private animate = () => {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (!this.isPaused && !this.isVictory && !this.isCaptured) {
      this.timeElapsed += delta;

      // 1. Update Player Controller
      this.playerController.update(delta, true);

      // 2. Check current room
      const pPos = this.playerController.position;
      const newRoom = LevelGenerator.getRoomAtPosition(pPos.x, pPos.z);
      if (newRoom !== this.currentRoom) {
        this.currentRoom = newRoom;
        MapSystem.getInstance().discoverRoom(newRoom);
      }

      // 3. Update Doors
      this.doorManager.update(delta);

      // 4. Check Laser Tripwires (ALARM EVENT)
      for (const tw of this.tripwires) {
        const inBounds =
          pPos.x >= tw.minX &&
          pPos.x <= tw.maxX &&
          pPos.z >= tw.minZ &&
          pPos.z <= tw.maxZ;

        if (inBounds) {
          if (!this.playerController.isCrouching) {
            if (!tw.isTriggered) {
              tw.isTriggered = true;
              this.hackerAI.dispatchToEvent(new THREE.Vector3(pPos.x, 0, pPos.z), tw.name);
              AudioManager.getInstance().playAlertSiren();
              if (this.onBannerAlert) {
                this.onBannerAlert(
                  `🚨 ALARM EVENT: ${tw.name} TRIGGERED! HACKER DISPATCHED TO YOUR LOCATION!`,
                  'warning'
                );
              }
            }
          } else {
            // Crouched safely underneath!
            tw.isTriggered = false;
          }
        } else {
          tw.isTriggered = false;
        }
      }

      // 5. Update Hacker AI with 2-Attempt Strike Rule & Wall Occlusion
      const isBedroomDoorOpen = !!this.doorManager.getDoorDefinition('door_bedroom')?.isOpen;
      const aiResult = this.hackerAI.update(
        delta,
        pPos,
        this.playerController.isSprinting,
        this.playerController.isCrouching,
        this.playerController.isFlashlightOn,
        this.settings.difficulty,
        this.currentRoom,
        isBedroomDoorOpen,
        this.levelColliders
      );

      // Strike 1: Warning issued, hacker stunned 8s to let player escape!
      if (aiResult.warned && this.onBannerAlert) {
        this.onBannerAlert(
          aiResult.message || '⚠️ BREACH 1 OF 2! HACKER STUNNED FOR 8 SECONDS — RUN AND CROUCH [CTRL]!',
          'warning'
        );
      }

      // Strike 2: Maximum attempts exceeded -> Captured!
      if (aiResult.captured) {
        this.isCaptured = true;
        this.capturesCount++;
        this.playerController.unlockPointer();
        if (this.onCaptured) {
          this.onCaptured();
        }
      }

      // 6. Threat & Proximity Tension Post-Processing Calculations
      const distToHacker = pPos.distanceTo(this.hackerAI.position);
      const isChase = this.hackerAI.state === 'CHASE';
      const isInvestigate = this.hackerAI.state === 'INVESTIGATE';
      const isSuspicious = this.hackerAI.state === 'SUSPICIOUS';

      let proximityThreat = 0;
      if (distToHacker < 16.0) {
        proximityThreat = 1.0 - (distToHacker - 2.0) / 14.0;
        proximityThreat = Math.max(0, Math.min(1, proximityThreat));
      }

      let stateThreat = 0;
      if (isChase) stateThreat = 1.0;
      else if (isInvestigate) stateThreat = 0.55;
      else if (isSuspicious) stateThreat = 0.35;

      const alertThreat = (this.hackerAI.alertLevel / 100) * 0.45;
      const targetThreat = Math.min(1.0, Math.max(proximityThreat, stateThreat) + alertThreat);

      this.currentThreatIntensity = THREE.MathUtils.damp(
        this.currentThreatIntensity,
        targetThreat,
        6.0,
        delta
      );

      const pulseSpeed = 2.2 + this.currentThreatIntensity * 4.6;

      const shakeAmount = isChase
        ? 0.0035 + Math.random() * 0.0035
        : this.currentThreatIntensity > 0.35
        ? (this.currentThreatIntensity - 0.35) * 0.0028
        : 0.0;

      if (this.currentThreatIntensity > 0.35) {
        const camShakeMag = (this.currentThreatIntensity - 0.35) * (isChase ? 0.015 : 0.005);
        this.camera.position.x += (Math.random() - 0.5) * camShakeMag;
        this.camera.position.y += (Math.random() - 0.5) * camShakeMag;
      }

      if (this.currentThreatIntensity > 0.3) {
        this.heartbeatAudioTimer += delta;
        const beatInterval = (Math.PI * 2) / pulseSpeed;
        if (this.heartbeatAudioTimer >= beatInterval) {
          this.heartbeatAudioTimer = 0;
          AudioManager.getInstance().playHackerWarningPulse();
        }
      } else {
        this.heartbeatAudioTimer = 0;
      }

      this.tensionPass.uniforms.time.value += delta;
      this.tensionPass.uniforms.threatIntensity.value = this.currentThreatIntensity;
      this.tensionPass.uniforms.pulseSpeed.value = pulseSpeed;
      this.tensionPass.uniforms.shakeAmount.value = shakeAmount;
      this.tensionPass.uniforms.glitchIntensity.value = isChase
        ? 0.75
        : this.currentThreatIntensity > 0.65
        ? 0.3
        : 0.0;

      // 7. Check Final Exit Gate Trigger
      if (this.exitTriggerBox && this.exitTriggerBox.containsPoint(pPos)) {
        this.isVictory = true;
        this.playerController.unlockPointer();
        AudioManager.getInstance().playVictoryFanfare();
        if (this.onVictory) {
          this.onVictory();
        }
      }

      // Check interaction key press (E)
      if (this.playerController.consumeActionKey()) {
        this.handleInteraction();
      }

      // 8. Notify React UI State
      if (this.onStateChange) {
        const layoutInfo = LevelGenerator.getLayoutInfo(this.layoutVariant);
        this.onStateChange({
          playerRoom: this.currentRoom,
          playerPos: [pPos.x, pPos.y, pPos.z],
          playerYaw: this.camera.rotation.y,
          hackerState: this.hackerAI.state,
          alertLevel: this.hackerAI.alertLevel,
          isMapUnlocked: MapSystem.getInstance().isUnlocked(),
          focusedInteractive: this.playerController.focusedInteractive,
          currentObjective: this.currentObjective,
          hackerStrikes: this.hackerAI.strikes,
          layoutVariant: this.layoutVariant,
          layoutName: layoutInfo.name,
        });
      }
    }

    // Render Scene with Post-Processing Pass
    this.composer.render();
  };

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.playerController.destroy();
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
