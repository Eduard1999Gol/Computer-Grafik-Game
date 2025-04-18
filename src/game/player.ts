import { Vector3 } from '@math.gl/core';
import { Vector } from '@math.gl/core/dist/classes/base/vector';

export class Player {
  position: Vector3;
  velocity: Vector3;
  size: number;
  lane: number; // 0 = most left, laneCount - 1 = most right
  laneCount: number;
  isJumping: boolean;
  jumpCooldown: number = 0;
  rotation: number = 0; // Current rotation angle in radians
  hardDifficulty: boolean;
  jumpSound: HTMLAudioElement;
  switchSound : HTMLAudioElement;
  
  
  constructor(hardDifficulty: boolean) {
    this.position = new Vector3(0, 0, 0);
    this.velocity = new Vector3(0, 0, 0);
    this.size = 1.1;
    this.lane = hardDifficulty ? 2 : 1; // Start in center lane
    this.isJumping = false;
    this.hardDifficulty = hardDifficulty;
    this.laneCount = hardDifficulty ? 5 : 3;
    
    // Jump sound
    this.jumpSound = new Audio('/assets/sounds/jump.mp3'); 
    this.jumpSound.volume = 0.2; // Adjust volume as needed

    // Switch sound 
    this.switchSound = new Audio('/assets/sounds/switch.mp3');
    this.switchSound.volume = 0.2;
  }
  
  moveLeft(): void {
    if (this.lane > 0) {
      this.lane--;
      this.switchSound.currentTime = 0;
      this.switchSound.play().catch(e => console.error('Error playing switch sound:', e));
    }
  }
  
  moveRight(): void {
    if (this.lane < this.laneCount - 1) {
      this.lane++;
      this.switchSound.currentTime = 0;
      this.switchSound.play().catch(e => console.error('Error playing switch sound:', e));

    }
  }
  
  jump(): void {
    if (!this.isJumping && this.jumpCooldown <= 0) {
      this.velocity[1] = 15.0;
      this.isJumping = true;
      this.jumpCooldown = 0.1; // Small cooldown to prevent double jumps
      
      this.jumpSound.currentTime = 0; // Reset sound to beginning
      this.jumpSound.play().catch(e => console.error('Error playing jump sound:', e));
    }
  }
  
  update(deltaTime: number, gameSpeed: number): void {
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= deltaTime;
    }
    
    // Apply gravity when in the air
    if (this.isJumping || this.position[1] > 0) {
      this.velocity[1] -= 30.0 * deltaTime; 
      this.position[1] += this.velocity[1] * deltaTime;
      
      // Check if landed
      if (this.position[1] <= 0) {
        this.position[1] = 0;
        this.velocity[1] = 0;
        this.isJumping = false;
      }
    }
    
    const targetX = (this.lane - Math.floor(this.laneCount / 2)) * 3; 
    const previousX = this.position[0];
    this.position[0] += (targetX - this.position[0]) * 10 * deltaTime;
    
    const baseRotationSpeed = 3.0;
    this.rotation -= baseRotationSpeed * gameSpeed * deltaTime;
    
    // sideways rotation when changing lanes
    const xMovement = this.position[0] - previousX;
    if (Math.abs(xMovement) > 0.01) {
      this.rotation -= xMovement * 2.0 * deltaTime;
    }
    
    // Keep rotation within 0-2π range
    if (this.rotation < 0) {
      this.rotation += Math.PI * 2;
    } else if (this.rotation > Math.PI * 2) {
      this.rotation -= Math.PI * 2;
    }
  }

  cancelJump(): void {
    if (this.isJumping && this.position[1] > 0) {
      this.velocity[1] = -20.0;
      
      this.switchSound.currentTime = 0; // Reset sound to beginning
      this.switchSound.play().catch(e => console.error('Error playing jump sound:', e));
    }
  }

  fall(deltaTime: number): void {
    this.velocity[1] -= 7.5 * deltaTime;
    this.position[1] += this.velocity[1] * deltaTime;
  }
}
