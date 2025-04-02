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
  private gameSpeed: number = 1;
  private score: number = 0;
  private gameOver: boolean = false;
  private gameStarted: boolean = false;
  private hardDifficulty: boolean = false;
  
  // Add callbacks for game state changes
  private onGameOverCallback?: (score: number) => void;
  private onScoreUpdateCallback?: (score: number) => void;
  
  constructor(private canvas: HTMLCanvasElement) {
    // Initialize WebGL context
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;
    
    // Initialize shader program
    this.shaderProgram = compileShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!this.shaderProgram) throw new Error('Failed to create shader program');
    
    // Initialize game components
    this.renderer = new Renderer(gl, this.shaderProgram);
    this.player = new Player();
    this.obstacleManager = new ObstacleManager();
    
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
      }
    });
    
    // Add touch controls for mobile devices
    this.canvas.addEventListener('touchstart', (event) => {
      if (this.gameOver) return;
      
      const touch = event.touches[0];
      const x = touch.clientX;
      const width = this.canvas.clientWidth;
      
      if (x < width / 3) {
        this.player.moveLeft();
      } else if (x > (width * 2) / 3) {
        this.player.moveRight();
      } else {
        this.player.jump();
      }
      
      event.preventDefault();
    });
  }
  
  // Add callbacks for game events
  public onGameOver(callback: (score: number) => void): void {
    this.onGameOverCallback = callback;
  }
  
  public onScoreUpdate(callback: (score: number) => void): void {
    this.onScoreUpdateCallback = callback;
  }
  
  public getScore(): number {
    return Math.floor(this.score);
  }
  
  public isGameOver(): boolean {
    return this.gameOver;
  }
  
  public start(): void {
    this.gameOver = false;
    this.score = 0;
    this.gameSpeed = 1;
    this.lastFrameTime = performance.now();
    
    // Reset game components
    this.player = new Player();
    this.obstacleManager = new ObstacleManager();
    
    // Start game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  private gameLoop(currentTime: number): void {
    // Calculate delta time
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    
    // Clear the canvas (only set the color, actual clearing is done in renderer)
    this.gl.clearColor(0.2, 0.3, 0.8, 1.0);
    
    if (!this.gameOver) {
      // Update game state
      this.update(deltaTime);
      
      // Render game
      this.render();
      
      // Continue game loop
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  private update(deltaTime: number): void {
    // Update player
    this.player.update(deltaTime);
    
    // Update obstacles
    this.obstacleManager.update(deltaTime, this.gameSpeed);
    
    // Update ground position for scrolling effect
    this.renderer.updateGroundPosition(deltaTime, this.gameSpeed);
    
    // Increase difficulty over time
    this.gameSpeed += deltaTime * 0.05;
    
    // Increment score
    this.score += deltaTime * 10 * this.gameSpeed;
    
    // Notify score update
    if (this.onScoreUpdateCallback) {
      this.onScoreUpdateCallback(Math.floor(this.score));
    }
    
    // Check for collisions
    if (this.obstacleManager.checkCollision(this.player)) {
      console.log('Collision detected!');
      
      this.gameOver = true;
      console.log('Game Over! Final Score:', Math.floor(this.score));
      
      // Notify game over
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
