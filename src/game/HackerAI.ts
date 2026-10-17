/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { HackerState, RoomId } from './types.ts';
import { AudioManager } from './AudioManager.ts';

export interface Waypoint {
  x: number;
  z: number;
  room: RoomId;
  waitDuration?: number;
}

export class HackerAI {
  public state: HackerState = 'MONITOR';
  public group: THREE.Group;
  // Stationary at Master Server Terminal (X: 18, Z: 11) until an alarm event occurs
  public position: THREE.Vector3 = new THREE.Vector3(18, 0, 11);
  public alertLevel: number = 0; // 0 to 100
  public isStunned: boolean = false;
  public stunTimer: number = 0;

  // 2-Attempt Strike System: Player gets 2 chances before full capture!
  public strikes: number = 0;
  public maxStrikes: number = 2;

  // Command station base position
  private basePosition: THREE.Vector3 = new THREE.Vector3(18, 0, 11);

  // Target location for investigation or event response
  private targetLocation: THREE.Vector3 = new THREE.Vector3(18, 0, 11);
  private stateTimer: number = 0;
  private currentEventName: string = '';

  // Procedural humanoid 3D parts
  private torsoMesh: THREE.Mesh;
  private headMesh: THREE.Mesh;
  private visorMesh: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private redVisorLight: THREE.PointLight;

  private walkAnimTime: number = 0;
  private patrolSpeed: number = 2.1;
  private chaseSpeed: number = 3.8;
  private footstepTimer: number = 0;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    const coatMat = new THREE.MeshStandardMaterial({
      color: 0x090d14,
      roughness: 0.8,
      metalness: 0.2,
    });
    const cyberArmorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });

    // 1. Torso
    const torsoGeom = new THREE.BoxGeometry(0.65, 0.9, 0.4);
    this.torsoMesh = new THREE.Mesh(torsoGeom, coatMat);
    this.torsoMesh.position.y = 1.25;
    this.torsoMesh.castShadow = true;
    this.group.add(this.torsoMesh);

    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.44), cyberArmorMat);
    chestPlate.position.set(0, 1.35, 0);
    this.group.add(chestPlate);

    // 2. Head with cybernetic hood
    const headGeom = new THREE.BoxGeometry(0.35, 0.4, 0.38);
    this.headMesh = new THREE.Mesh(headGeom, coatMat);
    this.headMesh.position.y = 1.95;
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // 3. Glowing Cyber Visor
    const visorGeom = new THREE.BoxGeometry(0.32, 0.12, 0.1);
    this.visorMesh = new THREE.Mesh(visorGeom, visorMat);
    this.visorMesh.position.set(0, 1.95, 0.18);
    this.group.add(this.visorMesh);

    this.redVisorLight = new THREE.PointLight(0x00e5ff, 1.2, 5);
    this.redVisorLight.position.set(0, 1.95, 0.4);
    this.group.add(this.redVisorLight);

    // 4. Legs
    const legGeom = new THREE.BoxGeometry(0.2, 0.8, 0.22);
    this.leftLeg = new THREE.Mesh(legGeom, cyberArmorMat);
    this.leftLeg.position.set(-0.18, 0.4, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeom, cyberArmorMat);
    this.rightLeg.position.set(0.18, 0.4, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // 5. Arms
    const armGeom = new THREE.BoxGeometry(0.16, 0.75, 0.18);
    this.leftArm = new THREE.Mesh(armGeom, coatMat);
    this.leftArm.position.set(-0.42, 1.2, 0);
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeom, coatMat);
    this.rightArm.position.set(0.42, 1.2, 0);
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    scene.add(this.group);
  }

  public reset(startPos: THREE.Vector3 = new THREE.Vector3(18, 0, 11)) {
    this.state = 'MONITOR';
    this.basePosition.copy(startPos);
    this.position.copy(startPos);
    this.targetLocation.copy(startPos);
    this.group.position.copy(startPos);
    this.alertLevel = 0;
    this.strikes = 0;
    this.stateTimer = 0;
    this.isStunned = false;
    this.stunTimer = 0;
    this.currentEventName = '';
    this.setVisorMode(false);
  }

  public stun(durationSeconds = 8.0) {
    this.isStunned = true;
    this.stunTimer = durationSeconds;
    this.state = 'SUSPICIOUS';
    this.setVisorMode(false, 0x38bdf8); // Stunned cyan
  }

  /**
   * Called when an in-game alarm event occurs (Laser tripwire, 2 failed keypad attempts, trap door, panic button)
   * Dispatches the hacker straight to the event location to lock the player!
   */
  public dispatchToEvent(eventLocation: THREE.Vector3, eventName: string) {
    this.currentEventName = eventName;
    this.targetLocation.copy(eventLocation);
    this.alertLevel = 100;
    this.state = 'CHASE';
    this.stateTimer = 18.0; // Has 18s window to search event area
    this.setVisorMode(true);
    AudioManager.getInstance().playAlertSiren();
  }

  public triggerAlert(targetLocation: THREE.Vector3, urgency = 35, eventName = 'SECURITY ALERT') {
    this.currentEventName = eventName;
    this.alertLevel = Math.min(100, this.alertLevel + urgency);
    this.targetLocation.copy(targetLocation);

    if (this.state !== 'CHASE') {
      this.state = 'INVESTIGATE';
      this.stateTimer = 10.0;
      this.setVisorMode(true);
      AudioManager.getInstance().playAlertSiren();
    }
  }

  private setVisorMode(isAlert: boolean, customColor?: number) {
    const col = customColor ?? (isAlert ? 0xef4444 : 0x00e5ff);
    (this.visorMesh.material as THREE.MeshStandardMaterial).color.setHex(col);
    (this.visorMesh.material as THREE.MeshStandardMaterial).emissive.setHex(col);
    this.redVisorLight.color.setHex(col);
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    isSprinting: boolean,
    isCrouching: boolean,
    isFlashlightOn: boolean,
    difficulty: 'easy' | 'normal' = 'normal',
    playerRoom: RoomId = 'bedroom',
    isBedroomDoorOpen: boolean = false,
    colliders: THREE.Box3[] = []
  ): {
    captured: boolean;
    warned: boolean;
    strikeCount: number;
    message?: string;
    state: HackerState;
    alertLevel: number;
  } {
    // 1. Handle Stun state
    if (this.isStunned) {
      this.stunTimer -= delta;
      // Oscillate visor cyan flicker during stun
      if (Math.random() < 0.2) {
        this.setVisorMode(false, 0x38bdf8);
      }
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.setVisorMode(this.state === 'CHASE');
      }
      return {
        captured: false,
        warned: false,
        strikeCount: this.strikes,
        state: this.state,
        alertLevel: this.alertLevel,
      };
    }

    // 2. Alert Level Decay (slowly cools down if not in CHASE)
    if (this.alertLevel > 0 && this.state !== 'CHASE') {
      this.alertLevel = Math.max(0, this.alertLevel - delta * 4.0);
      if (this.alertLevel <= 0 && this.state === 'INVESTIGATE') {
        this.state = 'MONITOR';
        this.setVisorMode(false);
      }
    }

    const distToPlayer = this.position.distanceTo(playerPos);

    // 3. 2-ATTEMPT STRIKE SYSTEM
    // When the hacker physically reaches the player (within 1.8m):
    if (distToPlayer < 1.8) {
      if (this.strikes === 0) {
        // Strike 1: Give player a clear, generous second chance!
        this.strikes = 1;
        this.stun(8.0); // Stun hacker for 8 seconds!
        AudioManager.getInstance().playAlertSiren();
        return {
          captured: false,
          warned: true,
          strikeCount: 1,
          message: '⚠️ BREACH 1 OF 2! HACKER STUNNED FOR 8 SECONDS — RUN & CROUCH [CTRL] NOW!',
          state: 'SUSPICIOUS',
          alertLevel: 60,
        };
      } else {
        // Strike 2: Maximum attempts exceeded -> Captured!
        this.strikes = 2;
        this.state = 'CAPTURE';
        AudioManager.getInstance().playCaptureSting();
        return {
          captured: true,
          warned: false,
          strikeCount: 2,
          message: 'CAPTURED: MAXIMUM ATTEMPTS EXCEEDED (2/2 STRIKES)',
          state: 'CAPTURE',
          alertLevel: 100,
        };
      }
    }

    // 4. ROOM & WALL OCCLUSION RULES
    // Bedroom with door closed is completely safe:
    const isPlayerSafeInClosedBedroom = playerRoom === 'bedroom' && !isBedroomDoorOpen;

    let canSee = false;
    let canHear = false;

    if (!isPlayerSafeInClosedBedroom) {
      // Direct line of sight check
      const toPlayer = new THREE.Vector3().subVectors(playerPos, this.position);
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion);
      const angleToPlayer = forward.angleTo(toPlayer.clone().normalize());

      // If flashlight is on, player is visible from farther; in darkness, player is stealthy
      const maxVisionDist = isFlashlightOn ? 14.0 : 8.5;
      const angleOk = distToPlayer < maxVisionDist && angleToPlayer < Math.PI * 0.45;

      if (angleOk) {
        // Raycast line of sight against walls
        const rayOrigin = new THREE.Vector3(this.position.x, 1.8, this.position.z);
        const rayDir = toPlayer.clone().normalize();
        const ray = new THREE.Ray(rayOrigin, rayDir);

        let isBlocked = false;
        for (const box of colliders) {
          const pt = new THREE.Vector3();
          if (ray.intersectBox(box, pt)) {
            if (rayOrigin.distanceTo(pt) < distToPlayer - 0.4) {
              isBlocked = true;
              break;
            }
          }
        }
        canSee = !isBlocked;
      }

      // Footstep hearing: Crouching is 100% silent; sprinting is loud
      if (!isCrouching && isSprinting) {
        const hearingRadius = 12.0;
        canHear = distToPlayer < hearingRadius;
      }
    }

    // 5. State transitions from perception
    if (canSee) {
      if (this.state !== 'CHASE') {
        AudioManager.getInstance().playHackerWarningPulse();
      }
      this.state = 'CHASE';
      this.targetLocation.copy(playerPos);
      this.setVisorMode(true);
      this.alertLevel = 95;
    } else if (canHear && this.state !== 'CHASE') {
      this.state = 'INVESTIGATE';
      this.targetLocation.copy(playerPos);
      this.stateTimer = 8.0;
      this.setVisorMode(true);
    }

    // Speed modifier based on difficulty
    const speedMult = difficulty === 'easy' ? 0.72 : 0.95;

    // 6. Movement AI Execution
    let moveTarget = new THREE.Vector3();
    let speed = this.patrolSpeed * speedMult;
    let isMoving = false;

    switch (this.state) {
      case 'MONITOR': {
        // Stationary at command post observing security feeds
        this.setVisorMode(false);
        this.headMesh.rotation.y = Math.sin(Date.now() * 0.002) * 0.35;
        isMoving = false;
        break;
      }

      case 'INVESTIGATE': {
        this.setVisorMode(true);
        moveTarget.copy(this.targetLocation);
        speed = this.patrolSpeed * speedMult * 1.1;
        isMoving = true;

        const distToTarget = new THREE.Vector2(this.position.x, this.position.z).distanceTo(
          new THREE.Vector2(this.targetLocation.x, this.targetLocation.z)
        );

        if (distToTarget < 1.2) {
          // Arrived at investigation spot - look around
          this.stateTimer -= delta;
          isMoving = false;
          this.headMesh.rotation.y = Math.sin(Date.now() * 0.005) * 0.5;

          if (this.stateTimer <= 0) {
            // Target lost, return to base post
            this.state = 'MONITOR';
            this.targetLocation.copy(this.basePosition);
            this.alertLevel = 0;
            this.setVisorMode(false);
          }
        }
        break;
      }

      case 'CHASE': {
        this.setVisorMode(true);
        // If can see player, pursue directly
        if (canSee) {
          this.targetLocation.copy(playerPos);
        }
        moveTarget.copy(this.targetLocation);
        speed = this.chaseSpeed * speedMult;
        isMoving = true;

        const distToTarget = new THREE.Vector2(this.position.x, this.position.z).distanceTo(
          new THREE.Vector2(this.targetLocation.x, this.targetLocation.z)
        );

        // If arrived at target without sight of player, downgrade to investigate
        if (!canSee && distToTarget < 1.5) {
          this.state = 'INVESTIGATE';
          this.stateTimer = 6.0;
        }
        break;
      }

      case 'SUSPICIOUS': {
        // Paused or stunned
        isMoving = false;
        break;
      }

      default:
        isMoving = false;
        break;
    }

    // 7. Update physics position & humanoid limb animation
    if (isMoving) {
      const dir = new THREE.Vector3().subVectors(moveTarget, this.position);
      dir.y = 0;
      const len = dir.length();

      if (len > 0.05) {
        dir.normalize();
        this.position.addScaledVector(dir, speed * delta);
        this.group.position.copy(this.position);

        // Smooth rotation towards move direction
        const targetAngle = Math.atan2(dir.x, dir.z);
        this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetAngle, delta * 8.0);

        // Limb swinging walk cycle
        this.walkAnimTime += delta * speed * 3.5;
        this.leftLeg.rotation.x = Math.sin(this.walkAnimTime) * 0.45;
        this.rightLeg.rotation.x = -Math.sin(this.walkAnimTime) * 0.45;
        this.leftArm.rotation.x = -Math.sin(this.walkAnimTime) * 0.35;
        this.rightArm.rotation.x = Math.sin(this.walkAnimTime) * 0.35;

        // Audible hacker footsteps
        this.footstepTimer += delta * speed;
        if (this.footstepTimer > 1.8) {
          this.footstepTimer = 0;
          if (distToPlayer < 16.0) {
            AudioManager.getInstance().playFootstep();
          }
        }
      }
    } else {
      // Idle pose reset
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
    }

    return {
      captured: false,
      warned: false,
      strikeCount: this.strikes,
      state: this.state,
      alertLevel: this.alertLevel,
    };
  }
}
