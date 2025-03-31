import { Vector3 } from '@math.gl/core';
import { Player } from './player';

interface Obstacle {
  position: Vector3;
  size: Vector3;
  lane: number;
  type: 'barrier' | 'hole';
}

export class ObstacleManager {
  private obstacles: Obstacle[] = [];
  private spawnDistance: number = 50; // Distance ahead where obstacles spawn
  private spawnTimer: number = 0;
  
  constructor() {
    // Initialize with a few obstacles
    this.spawnObstacle();
  }
  
  update(deltaTime: number, gameSpeed: number): void {
    // Move existing obstacles closer to player
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.position[2] += deltaTime * 10 * gameSpeed;
      
      // Remove obstacles that are behind the player
      if (obstacle.position[2] > 5) {
        this.obstacles.splice(i, 1);
      }
    }
    
    // Spawn new obstacles based on time and game speed
    this.spawnTimer -= deltaTime * gameSpeed;
    if (this.spawnTimer <= 0) {
      this.spawnObstacle();
      this.spawnTimer = 1.5 / gameSpeed; // Adjust spawn rate based on speed
    }
  }
  
  private spawnObstacle(): void {
    // Choose a random lane
    const lane = Math.floor(Math.random() * 3); // 0, 1, or 2
    const xPos = (lane - 1) * 2; // Convert lane to x position (-2, 0, 2)
    
    // Create a new obstacle
    this.obstacles.push({
      position: new Vector3([xPos, 0, -this.spawnDistance]), // Far ahead
      size: new Vector3([1.8, 1, 1]), // Size of obstacle
      lane: lane,
      type: Math.random() > 0.3 ? 'barrier' : 'hole' // 70% barriers, 30% holes
    });
  }
  
  checkCollision(player: Player): boolean {
    // Simple collision detection (could be improved)
    const playerPos = player.position;
    const playerSize = player.size;
    
    for (const obstacle of this.obstacles) {
      // Only check obstacles close to the player
      if (obstacle.position[2] > -2 && obstacle.position[2] < 2) {
        // Check if player and obstacle are in the same lane
        if (Math.abs(obstacle.lane - player.lane) < 0.5) {
          // Vertical collision depends on obstacle type
          if (obstacle.type === 'barrier' && playerPos[1] < obstacle.size[1]) {
            return true; // Collision with barrier
          } else if (obstacle.type === 'hole' && playerPos[1] <= 0) {
            return true; // Fell into a hole
          }
        }
      }
    }
    
    return false;
  }
  
  getObstacles(): Obstacle[] {
    return this.obstacles;
  }
}
