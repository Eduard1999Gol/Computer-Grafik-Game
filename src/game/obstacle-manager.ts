import { Vector3 } from '@math.gl/core';
import { Player } from './player';

interface Obstacle {
  position: Vector3;
  size: Vector3;
  lane: number;
  type: 'small-barrier' | 'large-barrier' | 'floating-barrier' | 'hole' | 'gold-coin' | 'red-coin';
}

export class ObstacleManager {
  private obstacles: Obstacle[] = [];
  private spawnDistance: number = 180; // Distance ahead where obstacles spawn
  private spawnTimer: number = 0;
  private initialSpawnDelay: number = 2.0; // Give player time to get ready
  private hardDifficulty: boolean;
  private goldCoinSound: HTMLAudioElement;
  private redCoinSound: HTMLAudioElement;
  constructor(hardDifficulty: boolean) {
    // Initial delay before spawning first obstacle
    this.spawnTimer = 0.0; //this.initialSpawnDelay;
    this.hardDifficulty = hardDifficulty;

    this.goldCoinSound = new Audio('/assets/sounds/gold-coin.mp3');
    this.goldCoinSound.volume = 0.5;

    this.redCoinSound = new Audio('/assets/sounds/red-coin.mp3');
    this.redCoinSound.volume = 0.5;
  }
  
  update(deltaTime: number, gameSpeed: number): void {
    // Move existing obstacles closer to player
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.position[2] += deltaTime * 10 * gameSpeed;
      
      // Remove obstacles that are behind the player
      switch (obstacle.type) {
        case 'hole':
          if (obstacle.position[2] > 7) this.obstacles.splice(i, 1);
          break;
        case 'large-barrier':
          if (obstacle.position[2] > 13) this.obstacles.splice(i, 1);
          break;
        case 'floating-barrier':
          if (obstacle.position[2] > 12.5) this.obstacles.splice(i, 1);
          break;
        default:
          if (obstacle.position[2] > 8.5) this.obstacles.splice(i, 1);
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

    const obstacleChoice = Math.random();
    if (obstacleChoice > 0.4) {
      const barrierType = Math.random();
      if (barrierType <= 0.33) obstacleType = 'small-barrier';
      else if (barrierType > 0.33 && barrierType <= 0.67) obstacleType = 'large-barrier';
      else obstacleType = 'floating-barrier';
    }
    else if (obstacleChoice <= 0.4 && obstacleChoice > 0.1) {
      obstacleType = 'hole';
    }
    else {
      if (Math.random() >= 0.5) obstacleType = "gold-coin";
      else obstacleType = "red-coin";
    }

    let obstacleSize = new Vector3(1, 1, 1);
    switch (obstacleType) {
      case 'small-barrier':
        obstacleSize = new Vector3(1, 1, 1);
        break;
      case 'large-barrier':
        obstacleSize = new Vector3(0.8, 2.5, 0.8);
        break;
      case 'floating-barrier':
        obstacleSize = new Vector3(0.8, 0.4, 1.5);
        break;
      case 'hole':
        obstacleSize = new Vector3(1.35, 0.01, 1.35);
        break;
      case 'gold-coin':
        obstacleSize = new Vector3(0.55, 0.55, 0.2);
        break;
      case 'red-coin':
        obstacleSize = new Vector3(0.7, 0.7, 0.2);
        break;
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
        yPos = 2 + obstacleSize[1];
        break;
      case 'hole':
        yPos = -0.8; // Position holes slightly 0.2 above the ground texture
        break;
      case 'gold-coin':
        yPos = -0.5 + obstacleSize[1] + Math.random() * 2.5;
        break;
      case 'red-coin':
        yPos = -0.5 + obstacleSize[1] + Math.random() * 2.5;
        break;
    }
    
    this.obstacles.push({
      position: new Vector3([
        xPos, 
        yPos,
        -this.spawnDistance
      ]),
      size: obstacleSize,
      lane: lane,
      type: obstacleType
    });
  }

  checkCollision(player: Player): [boolean, String] {
    // boundaries for player texture
    const playerBounds = getBounds(player.position, new Vector3(1, 1, 1));

    for (const obstacle of this.obstacles) {
      // boundaries for obstacle texture
      const obstacleBounds = getBounds(obstacle.position, obstacle.size);
      const collisionDistance = (obstacle.type == "hole") ? 0.79 : 1;
      if (sphereIntersectsCube(
        player.position,
        collisionDistance,
        [obstacleBounds.xNegative, obstacleBounds.yNegative, obstacleBounds.zNegative],
        [obstacleBounds.xPositive, obstacleBounds.yPositive, obstacleBounds.zPositive],
      )) {
        if (obstacle.type == "gold-coin") {
          obstacle.position[1] = -3;
          this.goldCoinSound.currentTime = 0;
          this.goldCoinSound.play().catch(e => console.error('Error playing gold coin sound:', e));
        }
        else if (obstacle.type == "red-coin") {
          obstacle.position[1] = -3;
          this.redCoinSound.currentTime = 0;
          this.redCoinSound.play().catch(e => console.error('Error playing red coin sound:', e));
        }
        return [true, obstacle.type];
      }
     }
    
    return [false, ""];
  }
  
  getObstacles(): Obstacle[] {
    return this.obstacles;
  }
}

const getBounds = (position: Vector3, size: Vector3) => ({
  xNegative: position[0] - size[0],
  xPositive: position[0] + size[0],
  yNegative: position[1] - size[1],
  yPositive: position[1] + size[1],
  zNegative: position[2] - size[2],
  zPositive: position[2] + size[2],
})

const sphereIntersectsCube = (
  sphereCenter: Vector3,
  sphereRadius: number,
  cubeNegBounds: [number, number, number],
  cubePosBounds: [number, number, number]
): boolean => {
  // squared euclidian distance from sphere center to cube
  // usage of squared distance to avoid usage of Math.sqrt
  let distanceSquared = 0;

  for (let i = 0; i < 3; i++) {
    const sphereCoord = sphereCenter[i];
    const min = cubeNegBounds[i];
    const max = cubePosBounds[i];

    // check if sphere is outside of cube
    // if yes, add squared distance for the current dimension to the final euclidian distance
    if (sphereCoord < min) {
      distanceSquared += (min - sphereCoord) ** 2;
    }
    else if (sphereCoord > max) {
      distanceSquared += (sphereCoord - max) ** 2;
    }
  }

  return distanceSquared <= sphereRadius ** 2;
};

