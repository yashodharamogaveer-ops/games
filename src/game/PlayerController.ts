/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { DoorManager } from './DoorManager.ts';
import { InteractiveObject } from './types.ts';
import { AudioManager } from './AudioManager.ts';

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public isLocked: boolean = false;
  public isSprinting: boolean = false;
  public isCrouching: boolean = false;
  public isFlashlightOn: boolean = false;
  public focusedInteractive: InteractiveObject | null = null;

  private domElement: HTMLElement;
  private doorManager: DoorManager;
  private colliders: THREE.Box3[] = [];
  private interactives: InteractiveObject[] = [];

  // Input states
  private keys: { [key: string]: boolean } = {};
  private euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private sensitivity: number = 0.0022;

  // Flashlight 3D spotlight attached to camera
  private flashlight: THREE.SpotLight;
  private flashlightTarget: THREE.Object3D;

  // Movement physics parameters
  private normalSpeed: number = 3.6;
  private sprintSpeed: number = 6.2;
  private crouchSpeed: number = 1.8;
  private standingHeight: number = 1.7;
  private crouchingHeight: number = 1.05;
  private currentCameraHeight: number = 1.7;
  private bobTimer: number = 0;
  private footstepTimer: number = 0;
  private playerRadius: number = 0.45;

  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    doorManager: DoorManager,
    startPos: THREE.Vector3 = new THREE.Vector3(-4, 1.7, 20)
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.doorManager = doorManager;
    this.position = startPos.clone();
    this.camera.position.copy(this.position);

    // Initial flashlight
    this.flashlight = new THREE.SpotLight(0xfff5e6, 2.5, 20, Math.PI / 4.5, 0.35, 1.5);
    this.flashlight.position.set(0, 0, 0);
    this.flashlight.castShadow = true;
    this.flashlight.visible = this.isFlashlightOn;

    this.flashlightTarget = new THREE.Object3D();
    this.flashlightTarget.position.set(0, 0, -5);
    this.camera.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;
    this.camera.add(this.flashlight);

    this.initEvents();
  }

  public setColliders(colliders: THREE.Box3[], interactives: InteractiveObject[]) {
    this.colliders = colliders;
    this.interactives = interactives;
  }

  public setSensitivity(multiplier: number) {
    this.sensitivity = 0.0022 * multiplier;
  }

  public setFlashlight(on: boolean) {
    this.isFlashlightOn = on;
    this.flashlight.visible = on;
    AudioManager.getInstance().playFlashlight();
  }

  public toggleFlashlight() {
    this.setFlashlight(!this.isFlashlightOn);
  }

  public reset(pos: THREE.Vector3 = new THREE.Vector3(-4, 1.7, 20), rotationY = 0) {
    this.position.copy(pos);
    this.velocity.set(0, 0, 0);
    this.euler.set(0, rotationY, 0);
    this.camera.quaternion.setFromEuler(this.euler);
    this.camera.position.copy(this.position);
    this.isCrouching = false;
    this.isSprinting = false;
    this.currentCameraHeight = this.standingHeight;
  }

  private initEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
  }

  public destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    this.unlockPointer();
  }

  public requestPointerLock() {
    if (!this.isLocked && this.domElement) {
      try {
        this.domElement.requestPointerLock();
      } catch {
        // pointer lock request fallback
      }
    }
  }

  public unlockPointer() {
    if (document.pointerLockElement === this.domElement) {
      document.exitPointerLock();
    }
  }

  private onPointerLockChange = () => {
    this.isLocked = document.pointerLockElement === this.domElement;
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.euler.y -= movementX * this.sensitivity;
    this.euler.x -= movementY * this.sensitivity;

    // Clamp pitch between -85 and +85 degrees
    const maxPitch = (Math.PI / 2) * 0.94;
    this.euler.x = Math.max(-maxPitch, Math.min(maxPitch, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    this.keys[event.code] = true;

    if (event.code === 'KeyF') {
      this.toggleFlashlight();
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.keys[event.code] = false;
  };

  public isActionPressed(): boolean {
    return !!this.keys['KeyE'];
  }

  public consumeActionKey(): boolean {
    if (this.keys['KeyE']) {
      this.keys['KeyE'] = false;
      return true;
    }
    return false;
  }

  public update(delta: number, canMove = true) {
    if (!canMove || !this.isLocked) {
      this.focusedInteractive = null;
      return;
    }

    this.isSprinting = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight']) && !this.isCrouching;
    this.isCrouching = !!(this.keys['ControlLeft'] || this.keys['KeyC']);

    // Camera height interpolation for crouching
    const targetHeight = this.isCrouching ? this.crouchingHeight : this.standingHeight;
    this.currentCameraHeight = THREE.MathUtils.damp(
      this.currentCameraHeight,
      targetHeight,
      10.0,
      delta
    );

    // Compute movement speed
    let speed = this.normalSpeed;
    if (this.isCrouching) speed = this.crouchSpeed;
    else if (this.isSprinting) speed = this.sprintSpeed;

    // Movement direction vectors relative to camera yaw
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

    const moveDir = new THREE.Vector3();
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveDir.add(forward);
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveDir.sub(forward);
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.add(right);
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving) {
      moveDir.normalize();

      // Footstep sound triggering
      this.footstepTimer += delta;
      const stepInterval = this.isSprinting ? 0.32 : this.isCrouching ? 0.6 : 0.45;
      if (this.footstepTimer > stepInterval) {
        this.footstepTimer = 0;
        AudioManager.getInstance().playFootstep(this.isSprinting);
      }

      // Head bobbing calculation
      this.bobTimer += delta * (this.isSprinting ? 14 : 9);
      const bobOffset = Math.sin(this.bobTimer) * (this.isSprinting ? 0.05 : 0.03);

      // Perform collision resolved displacement
      const deltaPos = moveDir.clone().multiplyScalar(speed * delta);
      this.moveWithCollision(deltaPos);

      this.camera.position.x = this.position.x;
      this.camera.position.z = this.position.z;
      this.camera.position.y = this.position.y + this.currentCameraHeight + bobOffset;
    } else {
      this.camera.position.x = this.position.x;
      this.camera.position.z = this.position.z;
      this.camera.position.y = this.position.y + this.currentCameraHeight;
    }

    // Raycast for contextual interactive object
    this.updateInteractiveRaycast();
  }

  private moveWithCollision(deltaPos: THREE.Vector3) {
    // Try X movement separately from Z movement (sliding along walls)
    const newPosX = this.position.clone().add(new THREE.Vector3(deltaPos.x, 0, 0));
    if (!this.checkCollision(newPosX)) {
      this.position.x = newPosX.x;
    }

    const newPosZ = this.position.clone().add(new THREE.Vector3(0, 0, deltaPos.z));
    if (!this.checkCollision(newPosZ)) {
      this.position.z = newPosZ.z;
    }
  }

  private checkCollision(testPos: THREE.Vector3): boolean {
    // 1. Check against closed doors
    if (this.doorManager.checkCollisions(testPos, this.playerRadius)) {
      return true;
    }

    // 2. Check against scene level colliders (walls and furniture)
    const playerSphere = new THREE.Sphere(testPos, this.playerRadius);
    for (const box of this.colliders) {
      if (box.intersectsSphere(playerSphere)) {
        return true;
      }
    }

    return false;
  }

  private updateInteractiveRaycast() {
    // Check distance to all interactives
    let closest: InteractiveObject | null = null;
    let minDistance = 2.8;

    const camPos = this.camera.position;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);

    for (const item of this.interactives) {
      const itemPos = new THREE.Vector3(item.position[0], item.position[1], item.position[2]);
      const dist = camPos.distanceTo(itemPos);

      if (dist < minDistance) {
        // Also verify player is generally looking towards the object
        const toItem = itemPos.clone().sub(camPos).normalize();
        const dot = forward.dot(toItem);

        if (dot > 0.55) {
          closest = { ...item, distance: dist };
          minDistance = dist;
        }
      }
    }

    // Also check door keypads
    for (const doorDef of this.doorManager.getAllDoorDefinitions()) {
      if (doorDef.isLocked) {
        const doorPos = new THREE.Vector3(doorDef.position[0], 1.5, doorDef.position[2]);
        const dist = camPos.distanceTo(doorPos);
        if (dist < minDistance) {
          const toDoor = doorPos.clone().sub(camPos).normalize();
          const dot = forward.dot(toDoor);
          if (dot > 0.55) {
            closest = {
              id: `door_${doorDef.id}`,
              name: doorDef.name,
              prompt: `[E] Access ${doorDef.label} Terminal`,
              position: [doorDef.position[0], 1.5, doorDef.position[2]],
              distance: dist,
              type: 'door',
              targetId: doorDef.id,
            };
            minDistance = dist;
          }
        }
      }
    }

    this.focusedInteractive = closest;
  }
}
