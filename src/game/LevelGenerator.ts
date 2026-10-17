/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomId, RoomDefinition, InteractiveObject, LaserTripwire, LayoutVariant, LayoutInfo } from './types.ts';
import { TextureGenerator } from './textureGenerator.ts';
import { DoorManager } from './DoorManager.ts';

export class LevelGenerator {
  public static currentVariant: LayoutVariant = 0;
  private static levelGroup: THREE.Group | null = null;

  public static getLayoutInfo(variant: LayoutVariant): LayoutInfo {
    switch (variant) {
      case 1:
        return {
          variant: 1,
          name: 'INVERTED FACILITY WING',
          description: 'Mirrored security configuration. Hardware Lab & Server Core swapped with Surveillance & Storage.',
          doorAssignments: {
            door_a: { toRoom: 'laboratory', name: 'Cyber Lab Access' },
            door_b: { toRoom: 'server_room', name: 'Server Core Vault' },
            door_c: { toRoom: 'surveillance_room', name: 'Surveillance Node Airlock' },
            door_d: { toRoom: 'storage_room', name: 'Storage Depot Gateway' },
          },
        };
      case 2:
        return {
          variant: 2,
          name: 'CROSS-FACILITY MATRIX',
          description: 'Diagonally shifted compound layout with cross-aisle security barriers and alternate item caches.',
          doorAssignments: {
            door_a: { toRoom: 'storage_room', name: 'Storage Depot Gateway' },
            door_b: { toRoom: 'surveillance_room', name: 'Surveillance Node Airlock' },
            door_c: { toRoom: 'server_room', name: 'Server Core Vault' },
            door_d: { toRoom: 'laboratory', name: 'Cyber Lab Access' },
          },
        };
      case 0:
      default:
        return {
          variant: 0,
          name: 'STANDARD COMPOUND',
          description: 'Standard compound architectural layout with west surveillance/storage and east lab/server wings.',
          doorAssignments: {
            door_a: { toRoom: 'surveillance_room', name: 'Surveillance Node Airlock' },
            door_b: { toRoom: 'storage_room', name: 'Storage Depot Gateway' },
            door_c: { toRoom: 'laboratory', name: 'Cyber Lab Access' },
            door_d: { toRoom: 'server_room', name: 'Server Core Vault' },
          },
        };
    }
  }

  public static getRoomDefinitions(variant: LayoutVariant = 0): RoomDefinition[] {
    const layout = this.getLayoutInfo(variant);
    const roomA = layout.doorAssignments.door_a.toRoom;
    const roomB = layout.doorAssignments.door_b.toRoom;
    const roomC = layout.doorAssignments.door_c.toRoom;
    const roomD = layout.doorAssignments.door_d.toRoom;

    const baseDefs: Record<RoomId, { name: string; color: string; desc: string }> = {
      bedroom: {
        name: 'Hostage Confinement Quarters',
        color: '#3b82f6',
        desc: 'The locked bedroom where you awoke. Clues to the escape blueprint are hidden here.',
      },
      security_hall: {
        name: 'Grand Security Atrium',
        color: '#10b981',
        desc: 'A fortified crossroads containing six security airlocks leading deeper into the compound.',
      },
      surveillance_room: {
        name: 'CCTV Surveillance Bunker',
        color: '#8b5cf6',
        desc: 'Wall monitors track the hacker’s compound and security cameras.',
      },
      storage_room: {
        name: 'Industrial Depot & Vault',
        color: '#f59e0b',
        desc: 'Storage area holding equipment, supply crates, and security access cards.',
      },
      laboratory: {
        name: 'Cybernetic Hardware Lab',
        color: '#ec4899',
        desc: 'A sterile workspace filled with circuit benches and logic terminals.',
      },
      server_room: {
        name: 'Mainframe Server Vault',
        color: '#06b6d4',
        desc: 'Humming server racks maintaining compound automation and firewall encryption.',
      },
      basement_passage: {
        name: 'Subterranean Utility Tunnel',
        color: '#ef4444',
        desc: 'A dim tunnel beneath the villa connecting the airlock to the outer perimeter.',
      },
      outer_garden: {
        name: 'Moonlit Perimeter & Final Exit',
        color: '#22c55e',
        desc: 'The courtyard outside the compound with the main high-voltage laser perimeter gate.',
      },
    };

    return [
      {
        id: 'bedroom',
        name: baseDefs.bedroom.name,
        floor: 1,
        description: baseDefs.bedroom.desc,
        bounds: { minX: -8, maxX: 0, minZ: 16, maxZ: 24 },
        color: baseDefs.bedroom.color,
        connectedDoors: ['door_bedroom'],
      },
      {
        id: 'security_hall',
        name: baseDefs.security_hall.name,
        floor: 1,
        description: baseDefs.security_hall.desc,
        bounds: { minX: -10, maxX: 10, minZ: -2, maxZ: 14 },
        color: baseDefs.security_hall.color,
        connectedDoors: ['door_bedroom', 'door_a', 'door_b', 'door_c', 'door_d', 'door_e', 'door_f'],
      },
      // West Wing South (Door A)
      {
        id: roomA,
        name: baseDefs[roomA].name,
        floor: 1,
        description: baseDefs[roomA].desc,
        bounds: { minX: -22, maxX: -10, minZ: 6, maxZ: 14 },
        color: baseDefs[roomA].color,
        connectedDoors: ['door_a'],
      },
      // West Wing North (Door B)
      {
        id: roomB,
        name: baseDefs[roomB].name,
        floor: 1,
        description: baseDefs[roomB].desc,
        bounds: { minX: -22, maxX: -10, minZ: -2, maxZ: 6 },
        color: baseDefs[roomB].color,
        connectedDoors: ['door_b', 'door_e'],
      },
      // East Wing North (Door C)
      {
        id: roomC,
        name: baseDefs[roomC].name,
        floor: 1,
        description: baseDefs[roomC].desc,
        bounds: { minX: 10, maxX: 22, minZ: -2, maxZ: 6 },
        color: baseDefs[roomC].color,
        connectedDoors: ['door_c'],
      },
      // East Wing South (Door D)
      {
        id: roomD,
        name: baseDefs[roomD].name,
        floor: 1,
        description: baseDefs[roomD].desc,
        bounds: { minX: 10, maxX: 22, minZ: 6, maxZ: 14 },
        color: baseDefs[roomD].color,
        connectedDoors: ['door_d'],
      },
      {
        id: 'basement_passage',
        name: baseDefs.basement_passage.name,
        floor: 0,
        description: baseDefs.basement_passage.desc,
        bounds: { minX: 1, maxX: 9, minZ: -16, maxZ: -2 },
        color: baseDefs.basement_passage.color,
        connectedDoors: ['door_f'],
      },
      {
        id: 'outer_garden',
        name: baseDefs.outer_garden.name,
        floor: 1,
        description: baseDefs.outer_garden.desc,
        bounds: { minX: -14, maxX: 14, minZ: -34, maxZ: -16 },
        color: baseDefs.outer_garden.color,
        connectedDoors: ['door_exit'],
      },
    ];
  }

  public static buildWorld(
    scene: THREE.Scene,
    doorManager: DoorManager,
    layoutVariant: LayoutVariant = 0
  ): {
    colliders: THREE.Box3[];
    interactives: InteractiveObject[];
    lights: THREE.Light[];
    mapPickupMesh: THREE.Mesh;
    exitTriggerBox: THREE.Box3;
    tripwires: LaserTripwire[];
  } {
    this.currentVariant = layoutVariant;

    // Clean up previous level geometry if rebuilding
    if (this.levelGroup) {
      scene.remove(this.levelGroup);
    }
    this.levelGroup = new THREE.Group();
    scene.add(this.levelGroup);

    // Clean up previous doors
    doorManager.clearDoors(scene);

    const colliders: THREE.Box3[] = [];
    const interactives: InteractiveObject[] = [];
    const lights: THREE.Light[] = [];
    const tripwires: LaserTripwire[] = [];

    const floorTex = TextureGenerator.getFloorTexture();
    const wallTex = TextureGenerator.getWallTexture('neutral');
    const blueWallTex = TextureGenerator.getWallTexture('blue');
    const darkWallTex = TextureGenerator.getWallTexture('dark');

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.45,
      metalness: 0.35,
    });
    const blueWallMat = new THREE.MeshStandardMaterial({
      map: blueWallTex,
      roughness: 0.4,
      metalness: 0.4,
    });
    const darkWallMat = new THREE.MeshStandardMaterial({
      map: darkWallTex,
      roughness: 0.5,
      metalness: 0.3,
    });
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.35,
      metalness: 0.6,
    });
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x0f131a,
      roughness: 0.8,
    });

    const addWall = (
      x: number,
      y: number,
      z: number,
      width: number,
      height: number,
      depth: number,
      mat: THREE.Material = wallMat
    ) => {
      const geom = new THREE.BoxGeometry(width, height, depth);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.levelGroup!.add(mesh);

      const box = new THREE.Box3();
      box.setFromObject(mesh);
      colliders.push(box);
      return mesh;
    };

    const addFloor = (x: number, z: number, width: number, depth: number, mat: THREE.Material = floorMat) => {
      const geom = new THREE.PlaneGeometry(width, depth);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0, z);
      mesh.receiveShadow = true;
      this.levelGroup!.add(mesh);
      return mesh;
    };

    const addCeiling = (x: number, z: number, width: number, depth: number, height = 4) => {
      const geom = new THREE.PlaneGeometry(width, depth);
      const mesh = new THREE.Mesh(geom, ceilingMat);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.set(x, height, z);
      this.levelGroup!.add(mesh);
      return mesh;
    };

    // ==========================================
    // 1. STARTING BEDROOM (X: -8 to 0, Z: 16 to 24)
    // ==========================================
    addFloor(-4, 20, 8, 8);
    addCeiling(-4, 20, 8, 8, 3.8);

    // North wall with door opening at center (door is at X: -4, Z: 16)
    addWall(-6.5, 1.9, 16, 3, 3.8, 0.4, blueWallMat);
    addWall(-1.5, 1.9, 16, 3, 3.8, 0.4, blueWallMat);
    addWall(-4, 3.5, 16, 2.4, 0.6, 0.4, blueWallMat);

    // South, West, East walls
    addWall(-4, 1.9, 24, 8, 3.8, 0.4, blueWallMat);
    addWall(-8, 1.9, 20, 0.4, 3.8, 8, blueWallMat);
    addWall(0, 1.9, 20, 0.4, 3.8, 8, blueWallMat);

    // Bedroom Furniture: Desk
    const deskGroup = new THREE.Group();
    deskGroup.position.set(-6, 0, 22.5);

    const deskMat = new THREE.MeshStandardMaterial({ color: 0x222a38, roughness: 0.3, metalness: 0.7 });
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.2), deskMat);
    deskTop.position.set(0, 0.8, 0);
    deskTop.castShadow = true;
    deskGroup.add(deskTop);

    const legMat = new THREE.MeshStandardMaterial({ color: 0x111620, metalness: 0.9, roughness: 0.2 });
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), legMat);
    leg1.position.set(-1.1, 0.4, -0.5);
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), legMat);
    leg2.position.set(1.1, 0.4, -0.5);
    const leg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), legMat);
    leg3.position.set(-1.1, 0.4, 0.5);
    const leg4 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), legMat);
    leg4.position.set(1.1, 0.4, 0.5);
    deskGroup.add(leg1, leg2, leg3, leg4);

    // Desk Monitor
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(-0.3, 0.85, -0.1);
    const monitorStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.08, 0.2), legMat);
    monitorStand.position.set(0, 0.1, 0);
    const monitorBezel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.06), legMat);
    monitorBezel.position.set(0, 0.35, 0);
    const monitorScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.82, 0.48),
      new THREE.MeshBasicMaterial({ map: TextureGenerator.getMonitorScreenTexture('HOSTAGE TERMINAL ONLINE', false) })
    );
    monitorScreen.position.set(0, 0.35, 0.032);
    monitorGroup.add(monitorStand, monitorBezel, monitorScreen);
    deskGroup.add(monitorGroup);

    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.2), legMat);
    kb.position.set(-0.3, 0.86, 0.25);
    deskGroup.add(kb);

    this.levelGroup.add(deskGroup);

    const deskBox = new THREE.Box3();
    deskBox.setFromCenterAndSize(new THREE.Vector3(-6, 0.45, 22.5), new THREE.Vector3(2.5, 0.9, 1.3));
    colliders.push(deskBox);

    // Bed in bedroom
    const bedGroup = new THREE.Group();
    bedGroup.position.set(-1.6, 0, 22.5);
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.4), darkWallMat);
    bedFrame.position.set(0, 0.2, 0);
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.25, 1.25),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
    );
    mattress.position.set(0, 0.45, 0);
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 })
    );
    pillow.position.set(0.7, 0.6, 0);
    bedGroup.add(bedFrame, mattress, pillow);
    this.levelGroup.add(bedGroup);

    const bedCollider = new THREE.Box3();
    bedCollider.setFromCenterAndSize(new THREE.Vector3(-1.6, 0.35, 22.5), new THREE.Vector3(2.3, 0.7, 1.5));
    colliders.push(bedCollider);

    // ==========================================
    // DYNAMIC BLUEPRINT ESCAPE MAP PLACEMENT
    // ==========================================
    let mapPos: [number, number, number];
    let mapPrompt: string;
    if (layoutVariant === 1) {
      // Bedside cyber stand
      mapPos = [-1.5, 0.85, 20.8];
      mapPrompt = '[E] Take Escape Blueprint from Bedside Stand';
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.75, 0.6), deskMat);
      stand.position.set(-1.5, 0.37, 20.8);
      this.levelGroup.add(stand);
    } else if (layoutVariant === 2) {
      // Wall safe compartment
      mapPos = [-7.6, 1.15, 18.0];
      mapPrompt = '[E] Take Escape Blueprint from Secret Wall Safe';
      const safe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.6), darkWallMat);
      safe.position.set(-7.7, 1.15, 18.0);
      this.levelGroup.add(safe);
    } else {
      // Default: Desk lockbox
      mapPos = [-5.3, 1.0, 22.5];
      mapPrompt = '[E] Take Escape Blueprint from Desk Lockbox';
      const lockboxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.12, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
      );
      lockboxMesh.position.set(-5.3, 0.91, 22.5);
      this.levelGroup.add(lockboxMesh);
    }

    const mapMat = new THREE.MeshBasicMaterial({
      map: TextureGenerator.getMapPaperTexture(),
      side: THREE.DoubleSide,
    });
    const mapPickupMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), mapMat);
    mapPickupMesh.rotation.x = -Math.PI / 2;
    mapPickupMesh.rotation.z = 0.2;
    mapPickupMesh.position.set(mapPos[0], mapPos[1] - 0.05, mapPos[2]);
    this.levelGroup.add(mapPickupMesh);

    interactives.push({
      id: 'pickup_map',
      name: "Hacker's Blueprint Escape Map",
      prompt: mapPrompt,
      position: mapPos,
      type: 'item',
      targetId: 'item_escape_map',
    });

    // Bedroom desk note
    interactives.push({
      id: 'note_bedroom',
      name: 'Hostage Monitor Log',
      prompt: '[E] Read Hostage Protocol Message',
      position: [-6.3, 1.0, 22.5],
      type: 'note',
      targetId: 'note_bedroom',
    });

    const bedLight = new THREE.PointLight(0x38bdf8, 1.2, 8);
    bedLight.position.set(-4, 3.0, 20);
    this.levelGroup.add(bedLight);
    lights.push(bedLight);

    // ==========================================
    // 2. GRAND SECURITY HALL (X: -10 to 10, Z: -2 to 14)
    // ==========================================
    addFloor(0, 6, 20, 16);
    addCeiling(0, 6, 20, 16, 4.5);

    // South wall
    addWall(-7, 2.25, 14, 6, 4.5, 0.4);
    addWall(5, 2.25, 14, 10, 4.5, 0.4);
    addWall(-4, 3.9, 14, 2.4, 1.2, 0.4);

    // West wall (Door A at Z=10, Door B at Z=2)
    addWall(-10, 2.25, 12.6, 0.4, 4.5, 2.8);
    addWall(-10, 2.25, 6, 0.4, 4.5, 5.6);
    addWall(-10, 2.25, -0.6, 0.4, 4.5, 2.8);
    addWall(-10, 3.9, 10, 0.4, 1.2, 2.4);
    addWall(-10, 3.9, 2, 0.4, 1.2, 2.4);

    // East wall (Door D at Z=10, Door C at Z=2)
    addWall(10, 2.25, 12.6, 0.4, 4.5, 2.8);
    addWall(10, 2.25, 6, 0.4, 4.5, 5.6);
    addWall(10, 2.25, -0.6, 0.4, 4.5, 2.8);
    addWall(10, 3.9, 10, 0.4, 1.2, 2.4);
    addWall(10, 3.9, 2, 0.4, 1.2, 2.4);

    // North wall (Door E at X=-4, Door F at X=4)
    addWall(-7.6, 2.25, -2, 4.8, 4.5, 0.4);
    addWall(0, 2.25, -2, 5.6, 4.5, 0.4);
    addWall(7.6, 2.25, -2, 4.8, 4.5, 0.4);
    addWall(-4, 3.9, -2, 2.4, 1.2, 0.4);
    addWall(4, 3.9, -2, 2.4, 1.2, 0.4);

    // Central Holographic Security Pillar
    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(0, 0, 6);
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.0, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 })
    );
    baseMesh.position.y = 0.2;
    pillarGroup.add(baseMesh);

    const holoMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true })
    );
    holoMesh.position.y = 1.6;
    holoMesh.name = 'holoIcon';
    pillarGroup.add(holoMesh);

    const hallLight = new THREE.PointLight(0x00e5ff, 2.0, 14);
    hallLight.position.set(0, 2.5, 6);
    this.levelGroup.add(hallLight);
    lights.push(hallLight);

    this.levelGroup.add(pillarGroup);
    const pillarBox = new THREE.Box3();
    pillarBox.setFromCenterAndSize(new THREE.Vector3(0, 1.0, 6), new THREE.Vector3(1.6, 2.0, 1.6));
    colliders.push(pillarBox);

    // ==========================================
    // INTERACTIVE ALARM EVENT: Emergency Villa Alarm Console
    // ==========================================
    const alarmConsole = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.8, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, emissive: 0xef4444, emissiveIntensity: 0.3 })
    );
    alarmConsole.position.set(0, 1.5, 13.8);
    this.levelGroup.add(alarmConsole);

    interactives.push({
      id: 'alarm_villa_emergency',
      name: 'Emergency Villa Alarm Console',
      prompt: '[E] Trigger Emergency Siren (ALARM EVENT - HACKER INCOMING!)',
      position: [0, 1.5, 13.5],
      type: 'terminal',
      targetId: 'alarm_villa_emergency',
    });

    // ==========================================
    // 3. WEST WING SOUTH (X: -22 to -10, Z: 6 to 14)
    // ==========================================
    addFloor(-16, 10, 12, 8);
    addCeiling(-16, 10, 12, 8, 3.8);
    addWall(-22, 1.9, 10, 0.4, 3.8, 8, darkWallMat);
    addWall(-16, 1.9, 14, 12, 3.8, 0.4, darkWallMat);
    addWall(-16, 1.9, 6, 12, 3.8, 0.4, darkWallMat);

    // CCTV Wall
    const cctvMat = new THREE.MeshBasicMaterial({
      map: TextureGenerator.getMonitorScreenTexture('CAM 01 // PATROL MONITOR', false),
    });
    const cctvWall = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.4), cctvMat);
    cctvWall.position.set(-21.8, 2.2, 10);
    cctvWall.rotation.y = Math.PI / 2;
    this.levelGroup.add(cctvWall);

    const survDesk = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.8, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x1e2430, metalness: 0.8 })
    );
    survDesk.position.set(-18, 0.4, 10);
    this.levelGroup.add(survDesk);
    const survDeskBox = new THREE.Box3();
    survDeskBox.setFromObject(survDesk);
    colliders.push(survDeskBox);

    interactives.push({
      id: 'terminal_surveillance',
      name: 'Surveillance Node Terminal',
      prompt: '[E] Access Security Terminal',
      position: [-18, 0.9, 10],
      type: 'terminal',
      targetId: 'terminal_surveillance',
    });

    const survLight = new THREE.PointLight(0xa855f7, 1.5, 10);
    survLight.position.set(-16, 2.8, 10);
    this.levelGroup.add(survLight);
    lights.push(survLight);

    // ==========================================
    // 4. WEST WING NORTH (X: -22 to -10, Z: -2 to 6)
    // ==========================================
    addFloor(-16, 2, 12, 8);
    addCeiling(-16, 2, 12, 8, 3.8);
    addWall(-22, 1.9, 2, 0.4, 3.8, 8, darkWallMat);
    addWall(-16, 1.9, -2, 12, 3.8, 0.4, darkWallMat);

    // Storage Crates
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.4 });
    const crate1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.5), crateMat);
    crate1.position.set(-18, 0.6, 3);
    this.levelGroup.add(crate1);
    const crate1Box = new THREE.Box3();
    crate1Box.setFromObject(crate1);
    colliders.push(crate1Box);

    // ==========================================
    // DYNAMIC ALPHA KEYCARD PLACEMENT
    // ==========================================
    let keycardPos: [number, number, number];
    if (layoutVariant === 1) {
      // In Lab
      keycardPos = [17.5, 0.9, 2.5];
    } else if (layoutVariant === 2) {
      // In Surveillance
      keycardPos = [-18, 0.9, 11.2];
    } else {
      // In Storage on crate
      keycardPos = [-18, 1.25, 3];
    }

    const keycardMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.04, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.6 })
    );
    keycardMesh.position.set(keycardPos[0], keycardPos[1] - 0.02, keycardPos[2]);
    this.levelGroup.add(keycardMesh);

    interactives.push({
      id: 'pickup_alpha_keycard',
      name: 'Alpha Security Keycard',
      prompt: '[E] Pick up Alpha Keycard',
      position: keycardPos,
      type: 'item',
      targetId: 'item_alpha_keycard',
    });

    const storageLight = new THREE.PointLight(0xf59e0b, 1.5, 10);
    storageLight.position.set(-16, 2.8, 2);
    this.levelGroup.add(storageLight);
    lights.push(storageLight);

    // ==========================================
    // 5. EAST WING NORTH (X: 10 to 22, Z: -2 to 6)
    // ==========================================
    addFloor(16, 2, 12, 8);
    addCeiling(16, 2, 12, 8, 3.8);
    addWall(22, 1.9, 2, 0.4, 3.8, 8, darkWallMat);
    addWall(16, 1.9, -2, 12, 3.8, 0.4, darkWallMat);
    addWall(16, 1.9, 6, 12, 3.8, 0.4, darkWallMat);

    const labBench = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.85, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.15 })
    );
    labBench.position.set(16, 0.42, 2);
    this.levelGroup.add(labBench);
    const labBenchBox = new THREE.Box3();
    labBenchBox.setFromObject(labBench);
    colliders.push(labBenchBox);

    // Decrypted USB Drive on lab bench
    const usbMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.05, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.9 })
    );
    usbMesh.position.set(15.5, 0.9, 2);
    this.levelGroup.add(usbMesh);

    interactives.push({
      id: 'pickup_lab_usb',
      name: 'Decrypted Hacker USB Key',
      prompt: '[E] Pick up Hacker USB',
      position: [15.5, 0.95, 2],
      type: 'item',
      targetId: 'item_lab_usb',
    });

    const labLight = new THREE.PointLight(0xec4899, 1.4, 10);
    labLight.position.set(16, 2.8, 2);
    this.levelGroup.add(labLight);
    lights.push(labLight);

    // ==========================================
    // 6. EAST WING SOUTH (SERVER VAULT: X: 10 to 22, Z: 6 to 14)
    // ==========================================
    addFloor(16, 10, 12, 8);
    addCeiling(16, 10, 12, 8, 3.8);
    addWall(22, 1.9, 10, 0.4, 3.8, 8);
    addWall(16, 1.9, 14, 12, 3.8, 0.4);

    const serverTex = TextureGenerator.getServerRackTexture();
    const rackMat = new THREE.MeshStandardMaterial({ map: serverTex, roughness: 0.3, metalness: 0.8 });
    for (let r = 0; r < 3; r++) {
      const rack1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 0.8), rackMat);
      rack1.position.set(14, 1.6, 8.5 + r * 1.8);
      this.levelGroup.add(rack1);
      const b1 = new THREE.Box3();
      b1.setFromObject(rack1);
      colliders.push(b1);

      const rack2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 0.8), rackMat);
      rack2.position.set(18.5, 1.6, 8.5 + r * 1.8);
      this.levelGroup.add(rack2);
      const b2 = new THREE.Box3();
      b2.setFromObject(rack2);
      colliders.push(b2);
    }

    // Mainframe Core Terminal
    const serverTerminal = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
    );
    serverTerminal.position.set(16, 0.7, 13.2);
    this.levelGroup.add(serverTerminal);
    const termBox = new THREE.Box3();
    termBox.setFromObject(serverTerminal);
    colliders.push(termBox);

    interactives.push({
      id: 'terminal_server',
      name: 'Mainframe Encryption Terminal',
      prompt: '[E] Hack Mainframe Console',
      position: [16, 1.0, 12.8],
      type: 'terminal',
      targetId: 'puzzle_server_terminal',
    });

    const serverLight = new THREE.PointLight(0x06b6d4, 1.8, 12);
    serverLight.position.set(16, 2.8, 10);
    this.levelGroup.add(serverLight);
    lights.push(serverLight);

    // ==========================================
    // 7. TRAP VAULT (DOOR E: X: -7 to -1, Z: -12 to -2)
    // ==========================================
    addFloor(-4, -7, 6, 10);
    addCeiling(-4, -7, 6, 10, 3.5);
    addWall(-7, 1.75, -7, 0.4, 3.5, 10, darkWallMat);
    addWall(-1, 1.75, -7, 0.4, 3.5, 10, darkWallMat);
    addWall(-4, 1.75, -12, 6, 3.5, 0.4, darkWallMat);

    // Prototype EMP Disrupter on pedestal
    const empPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
    );
    empPedestal.position.set(-4, 0.45, -9);
    this.levelGroup.add(empPedestal);

    const empWeapon = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.0 })
    );
    empWeapon.position.set(-4, 1.0, -9);
    this.levelGroup.add(empWeapon);

    interactives.push({
      id: 'pickup_emp_device',
      name: 'Prototype EMP Stun Disrupter',
      prompt: '[E] Grab EMP Disrupter Tool',
      position: [-4, 1.0, -9],
      type: 'item',
      targetId: 'item_emp_device',
    });

    const trapLight = new THREE.PointLight(0xef4444, 1.8, 8);
    trapLight.position.set(-4, 2.5, -7);
    this.levelGroup.add(trapLight);
    lights.push(trapLight);

    // ==========================================
    // 8. BASEMENT PASSAGE (DOOR F: X: 1 to 9, Z: -16 to -2)
    // ==========================================
    addFloor(5, -9, 8, 14);
    addCeiling(5, -9, 8, 14, 3.2);
    addWall(1, 1.6, -9, 0.4, 3.2, 14);
    addWall(9, 1.6, -9, 0.4, 3.2, 14);

    // North wall of basement leading into outer garden at X: 5, Z: -16
    addWall(2.5, 1.6, -16, 3, 3.2, 0.4);
    addWall(7.5, 1.6, -16, 3, 3.2, 0.4);
    addWall(5, 2.8, -16, 2, 0.8, 0.4);

    // Gate Relay Fuse
    const fuseBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.5, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.7 })
    );
    fuseBox.position.set(8.75, 1.4, -8);
    this.levelGroup.add(fuseBox);

    interactives.push({
      id: 'pickup_garden_fuse',
      name: 'High-Voltage Gate Relay Fuse',
      prompt: '[E] Take Perimeter Fuse',
      position: [8.6, 1.4, -8],
      type: 'item',
      targetId: 'item_garden_fuse',
    });

    const baseLight = new THREE.PointLight(0xf97316, 1.2, 10);
    baseLight.position.set(5, 2.4, -9);
    this.levelGroup.add(baseLight);
    lights.push(baseLight);

    // ==========================================
    // 9. OUTER GARDEN & FINAL EXIT (X: -14 to 14, Z: -34 to -16)
    // ==========================================
    const gardenGroundMat = new THREE.MeshStandardMaterial({
      color: 0x131c26,
      roughness: 0.8,
      metalness: 0.2,
    });
    addFloor(0, -25, 28, 18, gardenGroundMat);

    addWall(-14, 2.5, -25, 0.6, 5.0, 18);
    addWall(14, 2.5, -25, 0.6, 5.0, 18);
    addWall(-4.5, 2.5, -16, 19, 5.0, 0.6);
    addWall(11.5, 2.5, -16, 5, 5.0, 0.6);

    addWall(-8, 2.5, -34, 12, 5.0, 0.6);
    addWall(8, 2.5, -34, 12, 5.0, 0.6);
    addWall(0, 4.2, -34, 4, 1.6, 0.6);

    // Laser barrier blocking exit
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    for (let lz = 0; lz < 5; lz++) {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3.8), laserMat);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(0, 0.5 + lz * 0.6, -34);
      beam.name = 'laserBeam';
      this.levelGroup.add(beam);
    }

    const exitTerminal = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.2, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 })
    );
    exitTerminal.position.set(2.8, 0.6, -32.5);
    this.levelGroup.add(exitTerminal);
    const exitTermBox = new THREE.Box3();
    exitTermBox.setFromObject(exitTerminal);
    colliders.push(exitTermBox);

    interactives.push({
      id: 'terminal_exit_gate',
      name: 'Perimeter Laser Gate Terminal',
      prompt: '[E] Override Perimeter Laser Gate',
      position: [2.8, 1.0, -32.5],
      type: 'terminal',
      targetId: 'puzzle_exit_gate',
    });

    // Decorative planters
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
    const planterCoords = [
      [-6, -20],
      [6, -20],
      [-6, -28],
      [6, -28],
    ];
    for (const [px, pz] of planterCoords) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 0.7, 8), planterMat);
      pot.position.set(px, 0.35, pz);
      this.levelGroup.add(pot);

      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8), bushMat);
      bush.position.set(px, 0.9, pz);
      this.levelGroup.add(bush);

      const pBox = new THREE.Box3();
      pBox.setFromObject(pot);
      colliders.push(pBox);
    }

    const moonLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
    moonLight.position.set(15, 20, -10);
    moonLight.castShadow = true;
    this.levelGroup.add(moonLight);
    lights.push(moonLight);

    const gardenAmbient = new THREE.PointLight(0x38bdf8, 1.0, 20);
    gardenAmbient.position.set(0, 4, -25);
    this.levelGroup.add(gardenAmbient);
    lights.push(gardenAmbient);

    const exitTriggerBox = new THREE.Box3(
      new THREE.Vector3(-2.5, 0, -37),
      new THREE.Vector3(2.5, 3.5, -34.5)
    );

    // ==========================================
    // FUNCTIONAL LASER TRIPWIRES (ALARM EVENTS)
    // ==========================================
    const createTripwire = (
      id: string,
      name: string,
      room: RoomId,
      x1: number,
      z1: number,
      x2: number,
      z2: number,
      beamY = 1.25
    ): LaserTripwire => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);

      const beamGeom = new THREE.CylinderGeometry(0.018, 0.018, length);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
      const beamMesh = new THREE.Mesh(beamGeom, beamMat);
      beamMesh.position.set((x1 + x2) / 2, beamY, (z1 + z2) / 2);
      beamMesh.rotation.z = Math.PI / 2;
      beamMesh.rotation.y = angle;
      this.levelGroup!.add(beamMesh);

      // Warning emitter posts
      const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.12), postMat);
      post1.position.set(x1, beamY, z1);
      const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.12), postMat);
      post2.position.set(x2, beamY, z2);
      this.levelGroup!.add(post1, post2);

      const minX = Math.min(x1, x2) - 0.4;
      const maxX = Math.max(x1, x2) + 0.4;
      const minZ = Math.min(z1, z2) - 0.4;
      const maxZ = Math.max(z1, z2) + 0.4;

      return {
        id,
        name,
        room,
        minX,
        maxX,
        minZ,
        maxZ,
        beamY,
        isTriggered: false,
        beamMesh,
      };
    };

    // Layout-specific tripwire locations
    if (layoutVariant === 1) {
      tripwires.push(
        createTripwire('tripwire_hall', 'Security Atrium Center Beam', 'security_hall', -3, 6, 3, 6, 1.25)
      );
      tripwires.push(
        createTripwire('tripwire_server', 'Server Core Entry Sensor', 'security_hall', -9.8, 1, -9.8, 3, 1.25)
      );
    } else if (layoutVariant === 2) {
      tripwires.push(
        createTripwire('tripwire_atrium', 'Cross-Facility Laser Beam', 'security_hall', -4, 4, 4, 8, 1.25)
      );
      tripwires.push(
        createTripwire('tripwire_basement', 'Basement Entrance Sensor', 'security_hall', 3, -2.5, 5, -2.5, 1.25)
      );
    } else {
      // Default: Hall entrance & Vault E entrance
      tripwires.push(
        createTripwire('tripwire_entrance', 'Atrium Main Entrance Laser', 'security_hall', -5.2, 14.2, -2.8, 14.2, 1.25)
      );
      tripwires.push(
        createTripwire('tripwire_vault_e', 'Vault E Security Tripwire', 'security_hall', -5.2, -1.8, -2.8, -1.8, 1.25)
      );
    }

    // ==========================================
    // INITIALIZE DOORS WITH MATCHING LAYOUT
    // ==========================================
    doorManager.initDefinitions(layoutVariant);
    doorManager.createDoor3D('door_bedroom', scene);
    doorManager.createDoor3D('door_a', scene);
    doorManager.createDoor3D('door_b', scene);
    doorManager.createDoor3D('door_c', scene);
    doorManager.createDoor3D('door_d', scene);
    doorManager.createDoor3D('door_e', scene);
    doorManager.createDoor3D('door_f', scene);
    doorManager.createDoor3D('door_exit', scene);

    return {
      colliders,
      interactives,
      lights,
      mapPickupMesh,
      exitTriggerBox,
      tripwires,
    };
  }

  public static getRoomAtPosition(x: number, z: number): RoomId {
    const defs = this.getRoomDefinitions(this.currentVariant);
    for (const r of defs) {
      if (
        x >= r.bounds.minX &&
        x <= r.bounds.maxX &&
        z >= r.bounds.minZ &&
        z <= r.bounds.maxZ
      ) {
        return r.id;
      }
    }
    return 'security_hall';
  }
}
