import { Vector3 } from '@math.gl/core';
import { Player } from './player';

interface Obstacle {
  position: Vector3;
  size: Vector3;
  lane: number;
  type: 'small-barrier' | 'large-barrier' | 'floating-barrier' | 'hole';
}

export class ObstacleManager {
  private obstacles: Obstacle[] = [];
  private spawnDistance: number = 50; // Distance ahead where obstacles spawn
  private spawnTimer: number = 0;
  private initialSpawnDelay: number = 2.0; // Give player time to get ready
  private zCollisionDistance: number = 1.5; // Default distance between player and obstacle that leads to collision
  
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
    let obstacleType: Obstacle['type'];

    if (Math.random() > 0.3) {
      const barrierType = Math.random();
      if (barrierType <= 0.33) obstacleType = 'small-barrier';
      else if (barrierType > 0.33 && barrierType <= 0.67) obstacleType = 'large-barrier';
      else obstacleType = 'floating-barrier';
    } else {
      obstacleType = 'hole';
    }

    // original sizes:
    // barrier: 1.8, 1, 1
    // holes: 1.8, 0.1, 1
    let obstacleSize = new Vector3();
    switch (obstacleType) {
      case 'hole':
        obstacleSize = new Vector3([1, 0.1, 1]);
        break;
      case 'large-barrier':
        obstacleSize = new Vector3([0.8, 2.5, 0.3]);
        break;
      default:
        obstacleSize = new Vector3([0.8, 0.9, 0.5]);
    }

    let yPos = 0.0;
    if (obstacleType == 'small-barrier' || obstacleType == 'large-barrier') yPos = 1;
    else if (obstacleType == 'floating-barrier') yPos = 2.25;
    
    this.obstacles.push({
      position: new Vector3([
        xPos, 
        yPos,
        -this.spawnDistance
      ]), // Far ahead
      size: obstacleSize,
      lane: lane,
      type: obstacleType
    });
  }
  
  checkCollision(player: Player): boolean {
    // Simple collision detection with improved accuracy
    const xPosPlayer = player.position[0];
    const yPosPlayer = player.position[1];
    const zPosPlayer = player.position[2];
    const playerSize = player.size;
    
     for (const obstacle of this.obstacles) {
       // Only check obstacles close to the player (z-axis)
       const zPosObstacle = obstacle.position[2];
       if (Math.abs(zPosObstacle) >= this.zCollisionDistance) return false;

        const xPosObstacle = obstacle.position[0];
        const yPosObstacle = obstacle.position[1];

        const xDiff = Math.abs(xPosObstacle - xPosPlayer);
        const yDiff = yPosPlayer - yPosObstacle;
        
        // check if player is in the same lane as the obstacle
        if (xDiff >= 0.7) return false;

        switch (obstacle.type) {
          case 'hole':
            if (yPosPlayer < 0.1) return true;
            break;
          case 'floating-barrier':
            if (yPosPlayer + playerSize[1] <= yPosObstacle) return true;
            break;
          default:
            if (yPosPlayer <= yPosObstacle + obstacle.size[1]) return true;
        }


         // Check if player and obstacle are in the same lane (x-axis)
         // Adjust collision width to match the new barrier width
         /*
         if (Math.abs(obstacle.position[0] - playerPos[0]) < (obstacle.type != 'hole' ? 0.7 : 1.0)) {
           // Vertical collision depends on obstacle type (y-axis)
           if (obstacle.type != 'hole' && playerPos[1] < obstacle.position[1] + obstacle.size[1] - 1.25) {
             return true; // Collision with barrier (adjusted for new height)
           } else if (obstacle.type === 'hole' && playerPos[1] <= -1.9) {
             return true; // Fell into a hole (adjusted for new hole position)
           }
         }
           */
     }
    
    return false;
  }
  
  getObstacles(): Obstacle[] {
    return this.obstacles;
  }
}
