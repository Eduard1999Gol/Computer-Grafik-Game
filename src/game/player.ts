import { Vector3 } from '@math.gl/core';

export class Player {
  position: Vector3;
  velocity: Vector3;
  size: Vector3;
  lane: number; // 0 = left, 1 = center, 2 = right
  isJumping: boolean;
  jumpCooldown: number = 0;
  
  constructor() {
    this.position = new Vector3([0, 0, 0]);
    this.velocity = new Vector3([0, 0, 0]);
    this.size = new Vector3([0.3, 0.5, 0.3]); // Player size (width, height, depth)
    this.lane = 1; // Start in center lane
    this.isJumping = false;
  }
  
  moveLeft(): void {
    if (this.lane > 0) {
      this.lane--;
    }
  }
  
  moveRight(): void {
    if (this.lane < 2) {
      this.lane++;
    }
  }
  
  jump(): void {
    // Only allow jump if player is on the ground and cooldown is over
    if (!this.isJumping && this.jumpCooldown <= 0) {
      this.velocity[1] = 8.0; // Jump velocity - increased for better feel
      this.isJumping = true;
      this.jumpCooldown = 0.1; // Small cooldown to prevent double jumps
    }
  }
  
  update(deltaTime: number): void {
    // Decrease jump cooldown
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= deltaTime;
    }
    
    // Apply gravity when in the air
    if (this.isJumping || this.position[1] > 0) {
      this.velocity[1] -= 20.0 * deltaTime; // Stronger gravity for better feel
      this.position[1] += this.velocity[1] * deltaTime;
      
      // Check if landed
      if (this.position[1] <= 0) {
        this.position[1] = 0;
        this.velocity[1] = 0;
        this.isJumping = false;
      }
    }
    
    // Update lane position (smooth transition)
    const targetX = (this.lane - 1) * 2; // Convert lane to x position (-2, 0, 2)
    this.position[0] += (targetX - this.position[0]) * 10 * deltaTime;
  }
  
  getModelMatrix(): Float32Array {
    // In a real implementation, this would create and return a model matrix
    // based on the player's position, rotation, and scale
    return new Float32Array(16); // Simple placeholder
  }
}
