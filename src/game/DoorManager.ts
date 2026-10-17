/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { DoorId, DoorDefinition, DoorLockType } from './types.ts';
import { TextureGenerator } from './textureGenerator.ts';
import { AudioManager } from './AudioManager.ts';

export interface DoorMeshGroup {
  definition: DoorDefinition;
  rootGroup: THREE.Group;
  panelMesh: THREE.Mesh;
  statusLedMesh: THREE.Mesh;
  colliderBox: THREE.Box3;
  targetOpenProgress: number; // 0 = closed, 1 = open
  currentOpenProgress: number;
}

export class DoorManager {
  private static instance: DoorManager | null = null;
  private doors: Map<DoorId, DoorMeshGroup> = new Map();
  private doorDefinitions: Map<DoorId, DoorDefinition> = new Map();

  private constructor() {
    this.initDefinitions();
  }

  public static getInstance(): DoorManager {
    if (!DoorManager.instance) {
      DoorManager.instance = new DoorManager();
    }
    return DoorManager.instance;
  }

  public initDefinitions(layoutVariant: number = 0) {
    const roomConfigs = [
      // Variant 0: Standard
      [
        { toRoom: 'surveillance_room' as RoomId, name: 'Surveillance Node Airlock', lockType: 'number_keypad' as DoorLockType, puzzleId: 'puzzle_door_a', statusText: 'LOCKED // FREQUENCY KEYPAD' },
        { toRoom: 'storage_room' as RoomId, name: 'Storage Depot Gateway', lockType: 'logic_riddle' as DoorLockType, puzzleId: 'puzzle_door_b', statusText: 'LOCKED // SECURITY RIDDLE' },
        { toRoom: 'laboratory' as RoomId, name: 'Cyber Lab Access', lockType: 'circuit_memory' as DoorLockType, puzzleId: 'puzzle_door_c', statusText: 'LOCKED // OPTICAL SEQUENCE' },
        { toRoom: 'server_room' as RoomId, name: 'Server Core Vault', lockType: 'keycard' as DoorLockType, requiredItemId: 'item_alpha_keycard', statusText: 'LOCKED // ALPHA KEYCARD REQUIRED' },
      ],
      // Variant 1: Swapped East/West
      [
        { toRoom: 'laboratory' as RoomId, name: 'Cyber Lab Access', lockType: 'circuit_memory' as DoorLockType, puzzleId: 'puzzle_door_c', statusText: 'LOCKED // OPTICAL SEQUENCE' },
        { toRoom: 'server_room' as RoomId, name: 'Server Core Vault', lockType: 'keycard' as DoorLockType, requiredItemId: 'item_alpha_keycard', statusText: 'LOCKED // ALPHA KEYCARD REQUIRED' },
        { toRoom: 'surveillance_room' as RoomId, name: 'Surveillance Node Airlock', lockType: 'number_keypad' as DoorLockType, puzzleId: 'puzzle_door_a', statusText: 'LOCKED // FREQUENCY KEYPAD' },
        { toRoom: 'storage_room' as RoomId, name: 'Storage Depot Gateway', lockType: 'logic_riddle' as DoorLockType, puzzleId: 'puzzle_door_b', statusText: 'LOCKED // SECURITY RIDDLE' },
      ],
      // Variant 2: Diagonally Inverted
      [
        { toRoom: 'storage_room' as RoomId, name: 'Storage Depot Gateway', lockType: 'logic_riddle' as DoorLockType, puzzleId: 'puzzle_door_b', statusText: 'LOCKED // SECURITY RIDDLE' },
        { toRoom: 'surveillance_room' as RoomId, name: 'Surveillance Node Airlock', lockType: 'number_keypad' as DoorLockType, puzzleId: 'puzzle_door_a', statusText: 'LOCKED // FREQUENCY KEYPAD' },
        { toRoom: 'server_room' as RoomId, name: 'Server Core Vault', lockType: 'keycard' as DoorLockType, requiredItemId: 'item_alpha_keycard', statusText: 'LOCKED // ALPHA KEYCARD REQUIRED' },
        { toRoom: 'laboratory' as RoomId, name: 'Cyber Lab Access', lockType: 'circuit_memory' as DoorLockType, puzzleId: 'puzzle_door_c', statusText: 'LOCKED // OPTICAL SEQUENCE' },
      ],
      // Variant 3: Cross Wing
      [
        { toRoom: 'server_room' as RoomId, name: 'Server Core Vault', lockType: 'keycard' as DoorLockType, requiredItemId: 'item_alpha_keycard', statusText: 'LOCKED // ALPHA KEYCARD REQUIRED' },
        { toRoom: 'laboratory' as RoomId, name: 'Cyber Lab Access', lockType: 'circuit_memory' as DoorLockType, puzzleId: 'puzzle_door_c', statusText: 'LOCKED // OPTICAL SEQUENCE' },
        { toRoom: 'storage_room' as RoomId, name: 'Storage Depot Gateway', lockType: 'logic_riddle' as DoorLockType, puzzleId: 'puzzle_door_b', statusText: 'LOCKED // SECURITY RIDDLE' },
        { toRoom: 'surveillance_room' as RoomId, name: 'Surveillance Node Airlock', lockType: 'number_keypad' as DoorLockType, puzzleId: 'puzzle_door_a', statusText: 'LOCKED // FREQUENCY KEYPAD' },
      ],
    ];

    const currentCfg = roomConfigs[layoutVariant % roomConfigs.length];

    const defs: DoorDefinition[] = [
      {
        id: 'door_bedroom',
        label: 'BEDROOM',
        name: 'Bedroom Security Hatch',
        fromRoom: 'bedroom',
        toRoom: 'security_hall',
        lockType: 'number_keypad',
        position: [-4, 0, 16],
        rotationY: 0,
        isOpen: false,
        isLocked: true,
        puzzleId: 'puzzle_bedroom',
        statusText: 'LOCKED // CODE REQUIRED',
      },
      {
        id: 'door_a',
        label: 'DOOR A',
        name: currentCfg[0].name,
        fromRoom: 'security_hall',
        toRoom: currentCfg[0].toRoom,
        lockType: currentCfg[0].lockType,
        position: [-10, 0, 10],
        rotationY: Math.PI / 2,
        isOpen: false,
        isLocked: true,
        puzzleId: currentCfg[0].puzzleId,
        requiredItemId: currentCfg[0].requiredItemId,
        statusText: currentCfg[0].statusText,
      },
      {
        id: 'door_b',
        label: 'DOOR B',
        name: currentCfg[1].name,
        fromRoom: 'security_hall',
        toRoom: currentCfg[1].toRoom,
        lockType: currentCfg[1].lockType,
        position: [-10, 0, 2],
        rotationY: Math.PI / 2,
        isOpen: false,
        isLocked: true,
        puzzleId: currentCfg[1].puzzleId,
        requiredItemId: currentCfg[1].requiredItemId,
        statusText: currentCfg[1].statusText,
      },
      {
        id: 'door_c',
        label: 'DOOR C',
        name: currentCfg[2].name,
        fromRoom: 'security_hall',
        toRoom: currentCfg[2].toRoom,
        lockType: currentCfg[2].lockType,
        position: [10, 0, 2],
        rotationY: -Math.PI / 2,
        isOpen: false,
        isLocked: true,
        puzzleId: currentCfg[2].puzzleId,
        requiredItemId: currentCfg[2].requiredItemId,
        statusText: currentCfg[2].statusText,
      },
      {
        id: 'door_d',
        label: 'DOOR D',
        name: currentCfg[3].name,
        fromRoom: 'security_hall',
        toRoom: currentCfg[3].toRoom,
        lockType: currentCfg[3].lockType,
        position: [10, 0, 10],
        rotationY: -Math.PI / 2,
        isOpen: false,
        isLocked: true,
        puzzleId: currentCfg[3].puzzleId,
        requiredItemId: currentCfg[3].requiredItemId,
        statusText: currentCfg[3].statusText,
      },
      {
        id: 'door_e',
        label: 'DOOR E',
        name: 'Restricted Vault (Trap)',
        fromRoom: 'security_hall',
        toRoom: 'storage_room',
        lockType: 'trap_switch',
        position: [-4, 0, -2],
        rotationY: 0,
        isOpen: false,
        isLocked: true,
        statusText: 'RESTRICTED // HIGH VOLTAGE',
      },
      {
        id: 'door_f',
        label: 'DOOR F',
        name: 'Master Basement Airlock',
        fromRoom: 'security_hall',
        toRoom: 'basement_passage',
        lockType: 'master_override',
        position: [4, 0, -2],
        rotationY: 0,
        isOpen: false,
        isLocked: true,
        puzzleId: 'puzzle_door_f',
        statusText: 'LOCKED // MASTER OVERRIDE CODE REQUIRED',
      },
      {
        id: 'door_exit',
        label: 'EXIT',
        name: 'Perimeter Laser Gate',
        fromRoom: 'outer_garden',
        toRoom: 'outer_garden',
        lockType: 'unlocked',
        position: [0, 0, -32],
        rotationY: 0,
        isOpen: false,
        isLocked: true,
        puzzleId: 'puzzle_exit_gate',
        statusText: 'RESTRICTED // PERIMETER GATE',
      },
    ];

    this.doorDefinitions.clear();
    for (const d of defs) {
      this.doorDefinitions.set(d.id, d);

      // Reset existing 3D meshes if present
      const existingMesh = this.doors.get(d.id);
      if (existingMesh) {
        existingMesh.definition = d;
        existingMesh.targetOpenProgress = 0;
        existingMesh.currentOpenProgress = 0;
        existingMesh.panelMesh.position.y = 1.5;
        const ledMat = existingMesh.statusLedMesh.material as THREE.MeshStandardMaterial;
        ledMat.color.setHex(0xef4444);
        ledMat.emissive.setHex(0xef4444);
        const tex = TextureGenerator.getDoorPanelTexture(d.label, true);
        (existingMesh.panelMesh.material as THREE.MeshStandardMaterial).map = tex;
        (existingMesh.panelMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
        this.updateDoorCollider(existingMesh.rootGroup, existingMesh.colliderBox, false);
      }
    }
  }

  public createDoor3D(doorId: DoorId, parentScene: THREE.Scene): DoorMeshGroup {
    const def = this.doorDefinitions.get(doorId)!;

    const rootGroup = new THREE.Group();
    rootGroup.position.set(def.position[0], def.position[1], def.position[2]);
    rootGroup.rotation.y = def.rotationY;

    // Door Frame (Composite metallic pillars)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      metalness: 0.8,
      roughness: 0.3,
    });

    const frameWidth = 2.4;
    const frameHeight = 3.2;
    const postThick = 0.25;

    // Left post
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(postThick, frameHeight, 0.4), frameMat);
    leftPost.position.set(-frameWidth / 2 + postThick / 2, frameHeight / 2, 0);
    leftPost.castShadow = true;
    rootGroup.add(leftPost);

    // Right post
    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(postThick, frameHeight, 0.4), frameMat);
    rightPost.position.set(frameWidth / 2 - postThick / 2, frameHeight / 2, 0);
    rightPost.castShadow = true;
    rootGroup.add(rightPost);

    // Header beam
    const headerBeam = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, postThick, 0.4), frameMat);
    headerBeam.position.set(0, frameHeight - postThick / 2, 0);
    headerBeam.castShadow = true;
    rootGroup.add(headerBeam);

    // Door Panel Mesh (Sliding metal door with high-res procedural label)
    const panelWidth = frameWidth - postThick * 2;
    const panelHeight = frameHeight - postThick;
    const panelTex = TextureGenerator.getDoorPanelTexture(def.label, def.isLocked);

    const doorMat = new THREE.MeshStandardMaterial({
      map: panelTex,
      metalness: 0.85,
      roughness: 0.25,
    });

    const panelGeom = new THREE.BoxGeometry(panelWidth, panelHeight, 0.12);
    // Center geometry so sliding upward works cleanly
    const panelMesh = new THREE.Mesh(panelGeom, doorMat);
    panelMesh.position.set(0, panelHeight / 2, 0);
    panelMesh.castShadow = true;
    panelMesh.userData = { isDoor: true, doorId: def.id };
    rootGroup.add(panelMesh);

    // Security Terminal Console on Right Post
    const consoleMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.2), consoleMat);
    consoleBox.position.set(frameWidth / 2 + 0.25, 1.4, 0.1);
    rootGroup.add(consoleBox);

    // Status LED on terminal
    const ledMat = new THREE.MeshStandardMaterial({
      color: def.isLocked ? 0xef4444 : 0x10b981,
      emissive: def.isLocked ? 0xef4444 : 0x10b981,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    const statusLedMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), ledMat);
    statusLedMesh.position.set(frameWidth / 2 + 0.25, 1.55, 0.22);
    rootGroup.add(statusLedMesh);

    // Tag interactive target
    rootGroup.userData = { isInteractive: true, doorId: def.id, type: 'door' };

    parentScene.add(rootGroup);

    // Setup initial collider box
    const colliderBox = new THREE.Box3();
    this.updateDoorCollider(rootGroup, colliderBox, false);

    const doorMeshGroup: DoorMeshGroup = {
      definition: def,
      rootGroup,
      panelMesh,
      statusLedMesh,
      colliderBox,
      targetOpenProgress: def.isOpen ? 1 : 0,
      currentOpenProgress: def.isOpen ? 1 : 0,
    };

    this.doors.set(doorId, doorMeshGroup);
    return doorMeshGroup;
  }

  private updateDoorCollider(root: THREE.Group, box: THREE.Box3, isOpen: boolean) {
    if (isOpen) {
      // Empty collider when open so player walks through!
      box.makeEmpty();
    } else {
      // Solid obstacle blocking the doorway
      const center = new THREE.Vector3();
      root.getWorldPosition(center);
      // Box size ~ 2.4 wide, 3.2 high, 0.6 thick
      box.setFromCenterAndSize(
        new THREE.Vector3(center.x, center.y + 1.6, center.z),
        new THREE.Vector3(2.4, 3.2, 0.6)
      );
    }
  }

  public update(delta: number) {
    for (const d of this.doors.values()) {
      if (Math.abs(d.currentOpenProgress - d.targetOpenProgress) > 0.001) {
        d.currentOpenProgress = THREE.MathUtils.damp(
          d.currentOpenProgress,
          d.targetOpenProgress,
          6.0,
          delta
        );

        // Slide upward like a heavy hydraulic security door
        const maxSlide = 3.0;
        d.panelMesh.position.y = 1.5 + d.currentOpenProgress * maxSlide;

        if (d.currentOpenProgress > 0.85) {
          this.updateDoorCollider(d.rootGroup, d.colliderBox, true);
        } else {
          this.updateDoorCollider(d.rootGroup, d.colliderBox, false);
        }
      }
    }
  }

  public unlockAndOpen(doorId: DoorId) {
    const door = this.doors.get(doorId);
    if (!door) return;

    door.definition.isLocked = false;
    door.definition.isOpen = true;
    door.targetOpenProgress = 1;

    // Update LED to green
    const ledMat = door.statusLedMesh.material as THREE.MeshStandardMaterial;
    ledMat.color.setHex(0x10b981);
    ledMat.emissive.setHex(0x10b981);

    // Update texture to green unlocked
    const newTex = TextureGenerator.getDoorPanelTexture(door.definition.label, false);
    (door.panelMesh.material as THREE.MeshStandardMaterial).map = newTex;
    (door.panelMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;

    AudioManager.getInstance().playAccessGranted();
    setTimeout(() => {
      AudioManager.getInstance().playDoorOpen();
    }, 200);
  }

  public getDoor(doorId: DoorId): DoorMeshGroup | undefined {
    return this.doors.get(doorId);
  }

  public getDoorDefinition(doorId: DoorId): DoorDefinition | undefined {
    return this.doorDefinitions.get(doorId);
  }

  public getAllDoorDefinitions(): DoorDefinition[] {
    return Array.from(this.doorDefinitions.values());
  }

  public clearDoors(scene: THREE.Scene) {
    for (const d of this.doors.values()) {
      scene.remove(d.rootGroup);
    }
    this.doors.clear();
  }

  public checkCollisions(playerPos: THREE.Vector3, playerRadius = 0.45): boolean {
    const sphere = new THREE.Sphere(playerPos, playerRadius);
    for (const d of this.doors.values()) {
      if (d.currentOpenProgress < 0.85 && d.colliderBox.intersectsSphere(sphere)) {
        return true;
      }
    }
    return false;
  }
}
