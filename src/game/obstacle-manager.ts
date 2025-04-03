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
  private xCollisionDistance: number = 0.7; // Default distances between player and obstacle that leads to collision
  private zCollisionDistance: number = 1; 
  private hardDifficulty: boolean;
  constructor(hardDifficulty: boolean) {
    // Initial delay before spawning first obstacle
    this.spawnTimer = this.initialSpawnDelay;
    this.hardDifficulty = hardDifficulty;
  }
  
  update(deltaTime: number, gameSpeed: number): void {
    // Move existing obstacles closer to player
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.position[2] += deltaTime * 10 * gameSpeed;
      
      // Remove obstacles that are behind the player
      if (obstacle.position[2] > 10) {
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
    const laneCount = this.hardDifficulty ? 5 : 3
    const lane = Math.floor(Math.random() * laneCount); // random integer from 0 to laneCount - 1
    const xPos = (lane - Math.floor(laneCount / 2)) * 3; // Convert lane to x position, so that middle lane is x = 0 with distance 3 between lanes
    
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

    let obstacleSize = new Vector3();
    switch (obstacleType) {
      case 'hole':
        obstacleSize = new Vector3([1.5, 0.05, 1.5]); // Wider and flatter to look like a circle
        break;
      case 'large-barrier':
        obstacleSize = new Vector3([0.8, 2.5, 0.8]);
        break;
      case 'floating-barrier':
        obstacleSize = new Vector3([0.8, 1, 0.8]);
        break;
      default:
        obstacleSize = new Vector3([0.8, 0.8, 0.8]);
    }

    let yPos = 0.0;
    // ground texture begins at -1, player texture goes from height -1 to 1
    switch(obstacleType) {
      case 'small-barrier':
        yPos = -1 + obstacleSize[1];
        break;
      case 'large-barrier':
        yPos = -1 + obstacleSize[1];
        break;
      case 'floating-barrier':
        yPos = 1.5 + obstacleSize[1];
        break;
      case 'hole':
        yPos = -0.8; // Position holes slightly 0.2 above the ground texture
        break;
    }
    
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
    // boundaries for player texture
    const xPosPlayerTexBound = player.position[0] + 1;
    const xNegPlayerTexBound = player.position[0] - 1;
    const yPosPlayerTexBound = player.position[1] + 1;
    const yNegPlayerTexBound = player.position[1] - 1;
    const zPosPlayerTexBound = player.position[2] + 1;
    const zNegPlayerTexBound = player.position[2] - 1;

    for (const obstacle of this.obstacles) {
      // boundaries for obstacle texture
      const xPosObstacleTexBound = obstacle.position[0] + obstacle.size[0];
      const xNegObstacleTexBound = obstacle.position[0] - obstacle.size[0];
      const yPosObstacleTexBound = obstacle.position[1] + obstacle.size[1];
      const yNegObstacleTexBound = obstacle.position[1] - obstacle.size[1];
      const zPosObstacleTexBound = obstacle.position[2] + obstacle.size[2];
      const zNegObstacleTexBound = obstacle.position[2] - obstacle.size[2];

      // only check obstacles close to the player (z-axis)
      if (!intervalIntersect(zNegPlayerTexBound, zPosPlayerTexBound, zNegObstacleTexBound, zPosObstacleTexBound))
        return false;
      
      // check if player is in the same lane as the obstacle
      if (!intervalIntersect(xNegPlayerTexBound, xPosPlayerTexBound, xNegObstacleTexBound, xPosObstacleTexBound))
        return false;

      // check if player height is sufficient
      if (!intervalIntersect(yNegPlayerTexBound, yPosPlayerTexBound, yNegObstacleTexBound, yPosObstacleTexBound))
        return false;
      
      return true;
     }
    
    return false;
  }
  
  getObstacles(): Obstacle[] {
    return this.obstacles;
  }
}

const inInterval = (num: number, lowerBound: number, upperbound: number): boolean => {
  // use min / max to avoid wrong return values because of switched bounds
  return (num >= Math.min(lowerBound, upperbound)) && (num <= Math.max(lowerBound, upperbound));
}

const intervalIntersect = (lowerBoundA: number, upperBoundA: number, lowerBoundB: number, upperBoundB: number): boolean => {
  return (
    inInterval(lowerBoundA, lowerBoundB, upperBoundB) ||
    inInterval(upperBoundA, lowerBoundB, upperBoundB) ||
    inInterval(lowerBoundB, lowerBoundA, upperBoundA) ||
    inInterval(upperBoundB, lowerBoundA, upperBoundA)
    );
}
