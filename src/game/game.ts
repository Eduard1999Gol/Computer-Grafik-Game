import vertexShaderSource from './shaders/vertex.glsl';
import fragmentShaderSource from './shaders/fragment.glsl';
import { ObstacleManager } from './obstacle-manager';
import { Renderer } from './renderer';
import { Player } from './player';
import { compileShaderProgram } from '../lib/utils';

export class EndlessRunnerGame {
  private gl: WebGL2RenderingContext;
  private player: Player;
  private obstacleManager: ObstacleManager;
  private renderer: Renderer;
  
  private shaderProgram: WebGLProgram | null = null;
  
  private lastFrameTime: number = 0;
  private gameSpeed: number = 1.0;

  private score: number = 0;
  private lives: number = 1;
  private gameOver: boolean = false;
  private hardDifficulty: boolean = false;
  private soundGameOver: HTMLAudioElement = new Audio('/assets/sounds/fail.mp3');
  
  private paused: boolean = false;
  
  // Add callbacks for game state changes
  private onGameOverCallback?: (score: number) => void;
  private onScoreUpdateCallback?: (score: number) => void;
  private onPauseCallback?: (isPaused: boolean) => void;
  private onLivesUpdateCallback?: (lives: number) => void;
  
  constructor(private canvas: HTMLCanvasElement) {
    // Initialize WebGL context
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;
    
    // Initialize shader program
    this.shaderProgram = compileShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!this.shaderProgram) throw new Error('Failed to create shader program');
    
    // Initialize game components
    this.renderer = new Renderer(gl, this.shaderProgram, this.getHardDifficulty.bind(this));
    this.player = new Player(this.hardDifficulty);
    this.obstacleManager = new ObstacleManager(this.hardDifficulty, this.getLives.bind(this));
    
    // Set up event listeners
    this.setupControls();
    this.loadAssets();
  }

  private async loadAssets(): Promise<void> {
    try {
      // Load all textures via the renderer
      await this.renderer.loadTextures();
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }
  
  private setupControls(): void {
    // Handle keyboard input (left, right, jump)
    document.addEventListener('keydown', (event) => {
      if (this.gameOver) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          this.player.moveLeft();
          break;
        case 'ArrowRight':
          this.player.moveRight();
          break;
        case 'ArrowUp':
        case ' ': // Spacebar
          this.player.jump();
          break;
        case 'ArrowDown':
          this.player.cancelJump();
          break;
        case 'Escape':
          this.togglePause();
          break;
      }
    });
  }
  
  public onGameOver(callback: (score: number) => void): void {
    this.onGameOverCallback = callback;
  }
  
  public onScoreUpdate(callback: (score: number) => void): void {
    this.onScoreUpdateCallback = callback;
  }
  
  public onPause(callback: (isPaused: boolean) => void): void {
    this.onPauseCallback = callback;
  }

  public onLivesUpdate(callback: (lives: number) => void): void {
    this.onLivesUpdateCallback = callback;
  }
  
  public getScore(): number {
    return Math.floor(this.score);
  }

  public getHardDifficulty(): boolean {
    return this.hardDifficulty;
  }

  public setHardDifficulty(hard: boolean) {
    this.hardDifficulty = hard;
  }

  public getLives(): number {
    return this.lives;
  }
  
  public isGameOver(): boolean {
    return this.gameOver;
  }
  
  public togglePause(): void {
    this.paused = !this.paused;
    
    if (this.onPauseCallback) {
      this.onPauseCallback(this.paused);
    }
    
    if (!this.paused) {
      // Resume the game loop
      this.lastFrameTime = performance.now();
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  public isPaused(): boolean {
    return this.paused;
  }
  
  public start(): void {
    this.gameOver = false;
    this.score = 0;
    this.lives = 1;
    this.gameSpeed = this.hardDifficulty ? 3 : 2;
    this.lastFrameTime = performance.now();
    
    this.player = new Player(this.hardDifficulty);
    this.obstacleManager = new ObstacleManager(this.hardDifficulty, this.getLives.bind(this));
    
    // Start game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  private gameLoop(currentTime: number): void {
    // Calculate delta time
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    
    if (!this.gameOver && !this.paused) {
      // Update game state
      this.update(deltaTime);
      
      // Render game
      this.render();
      
      // Continue game loop
      requestAnimationFrame(this.gameLoop.bind(this));
    } else if (this.paused) {
      // Just render the current frame but don't update game state
      this.render();
    }
  }
  
  private update(deltaTime: number): void {
    this.player.update(deltaTime, this.gameSpeed);
    this.obstacleManager.update(deltaTime, this.gameSpeed);
    
    // Update ground position for scrolling effect
    this.renderer.updateGroundPosition(deltaTime, this.gameSpeed);
    
    this.gameSpeed += deltaTime * (this.hardDifficulty ? 0.05 : 0.01);
    this.score += deltaTime * 10 * this.gameSpeed;
    
    if (this.onScoreUpdateCallback) {
      this.onScoreUpdateCallback(Math.floor(this.score));
    }

    const collisionResult = this.obstacleManager.checkCollision(this.player);
    if (collisionResult[0]) {
      switch (collisionResult[1]) {
        case "gold-coin":
          this.score *= 1.1;
          if (this.onScoreUpdateCallback) {
            this.onScoreUpdateCallback(Math.floor(this.score));
          }
          return;
        case "red-coin":
          this.score *= 0.85;
          if (this.onScoreUpdateCallback) {
            this.onScoreUpdateCallback(Math.floor(this.score));
          }
          return;
        case "life":
          this.lives += 1;
          if (this.onLivesUpdateCallback) {
            this.onLivesUpdateCallback(this.lives);
          }
          return;
        default:
          this.lives -= 1;
      }

      if (this.onLivesUpdateCallback) {
        this.onLivesUpdateCallback(this.lives);
      }

      if (this.lives > 0) return;

      if (collisionResult[1] == "hole") {
        while (this.player.position[1] >= -2.5) {
          this.player.fall(deltaTime);
          this.render();
        }
      }
      this.gameOver = true;
      this.soundGameOver.currentTime = 0; // Reset sound to beginning
      this.soundGameOver.play().catch(e => console.error('Error playing game over sound:', e));
      
      if (this.onGameOverCallback) {
        this.onGameOverCallback(Math.floor(this.score));
      }
    }
  }
  
  private render(): void {
    this.renderer.render(this.player, this.obstacleManager.getObstacles());
  }

  public resize(): void {
    // Adjust canvas and viewport when window resizes
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.renderer.updateProjection(this.canvas.width / this.canvas.height);
  }
}
