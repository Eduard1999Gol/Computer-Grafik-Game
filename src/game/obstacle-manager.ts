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
  private initialSpawnDelay: number = 2.0; // Give player time to get ready
  
  constructor() {
    // Initial delay before spawning first obstacle
    this.spawnTimer = this.initialSpawnDelay;
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
      // Adjust spawn rate based on speed (faster game = more frequent obstacles)
      this.spawnTimer = (1.5 / gameSpeed) + Math.random() * 0.5; 
    }
  }
  
  private spawnObstacle(): void {
    // Choose a random lane
    const lane = Math.floor(Math.random() * 3); // 0, 1, or 2
    const xPos = (lane - 1) * 2; // Convert lane to x position (-2, 0, 2)
    
    // Create a new obstacle
    const obstacleType = Math.random() > 0.3 ? 'barrier' : 'hole';
    const obstacleSize = obstacleType === 'barrier' 
      ? new Vector3([0.8, 2.5, 0.3])  // Reduced width from 1.2 to 0.8 for thinner barriers
      : new Vector3([1.2, 0.1, 1]); // Holes remain the same
    
    this.obstacles.push({
      position: new Vector3([
        xPos, 
        obstacleType === 'barrier' ? 1.25 : 0, // Adjusted y position for taller barriers
        -this.spawnDistance
      ]), // Far ahead
      size: obstacleSize,
      lane: lane,
      type: obstacleType
    });
  }
  
  checkCollision(player: Player): boolean {
    // Simple collision detection with improved accuracy
    const playerPos = player.position;
    const playerSize = player.size;
    
     for (const obstacle of this.obstacles) {
       // Only check obstacles close to the player (z-axis)
       if (Math.abs(obstacle.position[2]) < 2) {
         // Check if player and obstacle are in the same lane (x-axis)
         // Adjust collision width to match the new barrier width
         if (Math.abs(obstacle.position[0] - playerPos[0]) < (obstacle.type === 'barrier' ? 0.7 : 1.0)) {
           // Vertical collision depends on obstacle type (y-axis)
           if (obstacle.type === 'barrier' && playerPos[1] < obstacle.position[1] + obstacle.size[1] - 1.25) {
             return true; // Collision with barrier (adjusted for new height)
           } else if (obstacle.type === 'hole' && playerPos[1] <= -1.9) {
             return true; // Fell into a hole (adjusted for new hole position)
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
