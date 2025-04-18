import { Player } from './player';
import { Vector2, Vector3 } from '@math.gl/core';
import { 
  createPerspectiveMatrix, 
  createViewMatrix, 
  createModelViewMatrix, 
  normalMatrix
} from '@/lib/matrix-utils';
import { TextureManager } from '@/lib/texture-manager';
import { 
  drawGeometry,
  GeometryVAO,
  createGeometry,
  AttributeLocations 
} from '../lib/renderer-draw-utils';

import { Obstacle } from './obstacle-manager';

// Uniform locations type
interface UniformLocations {
  modelViewMatrix: WebGLUniformLocation | null;
  projectionMatrix: WebGLUniformLocation | null;
  normalMatrix: WebGLUniformLocation | null;
  diffuseColor: WebGLUniformLocation | null;
  lightPosition: WebGLUniformLocation | null;
  uTexture: WebGLUniformLocation | null;
  u_useTexture: WebGLUniformLocation | null;
  u_textureOffset: WebGLUniformLocation | null;
}

// Entity configuration type with better typing
interface EntityConfig {
  color: number[];
  geometry?: 'cube' | 'sphere';
  useTexture?: boolean;
  textureName?: string;
}

// Render options for an entity instance
interface RenderOptions {
  position: Vector3;
  scale?: Vector3;
  rotation?: number;
  useTexture?: boolean;
  textureName?: string;
  textureOffset?: number[];
  color?: number[];
  geometry?: 'cube' | 'sphere';
}

export class Renderer {
  // Shader locations
  private attribLocations: AttributeLocations = {
    position: 0,
    normal: 0,
    texCoord: 0
  };
  
  private uniformLocations: UniformLocations = {
    modelViewMatrix: null,
    projectionMatrix: null,
    normalMatrix: null,
    diffuseColor: null,
    lightPosition: null,
    uTexture: null,
    u_useTexture: null,
    u_textureOffset: null
  };
  
  // Geometry buffers
  //private cubeGeometry: GeometryBuffers;
  //private sphereGeometry: GeometryBuffers;
  private cubeGeometry: GeometryVAO;
  private sphereGeometry: GeometryVAO;
  
  // Matrices
  private projectionMatrix: Float32Array;
  private viewMatrix: Float32Array;
  
  // Texture manager
  private textureManager: TextureManager;
  
  // Ground tracking
  private groundTextureOffset: number = 0;
  
  // Default entity configurations
  private readonly entityConfigs: Record<string, EntityConfig> = {
    player: { color: [1, 1, 1], geometry: 'sphere' },
    obstacle: { color: [0.7, 0.7, 0.7], geometry: 'cube'},
    ground: { color: [1, 1, 1] },
    lanesBorder: { color: [1, 1, 1] },
    hole: { color: [0.4, 0.4, 0.4], geometry: 'cube' },
    sky: { color: [0.5, 0.7, 1], geometry: 'cube' },
    goldCoin: { color: [0.967, 0.702, 0.019], geometry: 'sphere' },
    redCoin: { color: [0.878, 0.282, 0.275], geometry: 'sphere' },
    life: { color: [0, 1, 0], geometry: 'sphere' }
  };
  
  // Light configuration
  
  constructor(
    private gl: WebGL2RenderingContext, 
    private shaderProgram: WebGLProgram,
    private getHardDifficulty: () => boolean
  ) {
    this.textureManager = new TextureManager(gl);
    this.projectionMatrix = new Float32Array(16);
    this.viewMatrix = new Float32Array(16);
    
    // Setup rendering pipeline
    this.setupShaderLocations();
    this.cubeGeometry = createGeometry(this.gl, this.attribLocations, false);
    this.sphereGeometry = createGeometry(this.gl, this.attribLocations, true);
    this.initializeRenderState();
    
    // Set initial projection matrix
    this.updateProjection(this.gl.canvas.width / this.gl.canvas.height);
    this.updateViewMatrix();
  }
  
  /**
   * Load all textures required for the game
   */
  public async loadTextures(): Promise<void> {
    try {
      await this.textureManager.loadTextures([
        { name: 'player', url: '/assets/textures/bark_cartoon.jpg' },
        { name: 'ground', url: '/assets/textures/stone_cartoon_largest.png' },
        { name: 'laneBorder', url: '/assets/textures/wood_pattern.jpg' },
        { name: 'small-barrier', url: '/assets/textures/crate.jpg' },
        { name: 'large-barrier', url: '/assets/textures/woodplanks_cartoon.jpg' },
        { name: 'floating-barrier', url: '/assets/textures/barrel.jpg' },
        { name: 'hole', url: '/assets/textures/hole3.png' },
        { name: 'sky', url: '/assets/textures/sky6.jpg' }
      ]);
          } catch (error) {
      console.error('Failed to load textures:', error);
    }
  }
  
  /**
   * Update ground position for scrolling effect
   */
  public updateGroundPosition(delta: number, gameSpeed: number): void {
    // Update texture offset for scrolling ground texture
    const textureScrollFactor = 0.05 / 1.8;
    this.groundTextureOffset += delta * gameSpeed * textureScrollFactor;
    if (this.groundTextureOffset > 100) {
      this.groundTextureOffset = 0;
    }
  }
  
  /**
   * Set up attribute and uniform locations from shader program
   */
  private setupShaderLocations(): void {
    this.attribLocations = {
      position: this.gl.getAttribLocation(this.shaderProgram, 'position'),
      normal: this.gl.getAttribLocation(this.shaderProgram, 'normal'),
      texCoord: this.gl.getAttribLocation(this.shaderProgram, 'texCoord')
    };
    
    this.uniformLocations = {
      modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'modelViewMatrix'),
      projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'projectionMatrix'),
      normalMatrix: this.gl.getUniformLocation(this.shaderProgram, 'normalMatrix'),
      diffuseColor: this.gl.getUniformLocation(this.shaderProgram, 'diffuseColor'),
      lightPosition: this.gl.getUniformLocation(this.shaderProgram, 'lightPosition'),
      uTexture: this.gl.getUniformLocation(this.shaderProgram, 'uTexture'),
      u_useTexture: this.gl.getUniformLocation(this.shaderProgram, 'u_useTexture'),
      u_textureOffset: this.gl.getUniformLocation(this.shaderProgram, 'u_textureOffset')
    };
  }
  
  /**
   * Initialize WebGL render state
   */
  private initializeRenderState(): void {
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LESS);
  }
  
  /**
   * Update projection matrix based on aspect ratio
   */
  public updateProjection(aspectRatio: number): void {
    // Set up a perspective projection
    const fieldOfView = (40 * Math.PI) / 180; // 40 degrees in radians
    const near = 0.1;
    const far = 200.0;
    
    // Calculate perspective projection matrix
    this.projectionMatrix = createPerspectiveMatrix(fieldOfView, aspectRatio, near, far);
  }
  
  /**
   * Update the view matrix (camera position)
   */
  private updateViewMatrix(): void {
    // Camera parameters
    const eye = [0, 10, 20]; // Camera position: higher and further back
    const center = [0, 5, 0]; // Look slightly ahead of the player
    const up = [0, 1, 0];     // Up direction
    
    this.viewMatrix = createViewMatrix(eye, center, up);
  }
  
  /**
   * Main render method
   */
  public render(player: Player, obstacles: Obstacle[]): void {
    this.beginFrame();
    this.renderSky();
    this.renderGround();
    this.renderLaneBorders();
    this.renderObstacles(obstacles);
    this.renderPlayer(player);
  }
  
  /**
   * Initialize frame for rendering
   */
  private beginFrame(): void {
    // Clear buffers
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Use shader program
    this.gl.useProgram(this.shaderProgram);
    
    // Set common uniforms
    this.gl.uniform3fv(this.uniformLocations.lightPosition, [0, 10, 20]);
    this.gl.uniformMatrix4fv(
      this.uniformLocations.projectionMatrix,
      false,
      this.projectionMatrix
    );
  }

    /**
   * Render the sky background
   */
    private renderSky(): void {
      // Create a large background plane
      const skyPosition = new Vector3(0, 0, -180); // Far behind everything
      const skyScale = new Vector3(180, 50, 1);   // Large plane to cover view
      
      this.renderEntity({
        position: skyPosition,
        scale: skyScale,
        useTexture: true,
        textureName: 'sky',
        rotation: Math.PI,
        geometry: 'cube',
        ...this.entityConfigs.sky
      });
    }
  
  /**
   * Render the player entity
   */
  private renderPlayer(player: Player): void {
    const playerScale = new Vector3(player.size, player.size, player.size);
    this.renderEntity({
      scale: playerScale,
      position: player.position,
      rotation: player.rotation,
      useTexture: true,
      textureName: 'player',
      ...this.entityConfigs.player
    });
  }
  
  /**
   * Render all obstacles
   */
  private renderObstacles(obstacles: Obstacle[]): void {
    for (const obstacle of obstacles) {
      // Determine the config based on obstacle type
      let obstacleType = 'obstacle';
      switch (obstacle.type) {
        case 'hole':
          obstacleType = "hole";
          break;
        case 'gold-coin':
          obstacleType = "goldCoin";
          break;
        case 'red-coin':
          obstacleType = "redCoin";
          break;
        case 'life':
          obstacleType = "life";
          break;
      }
      const config = this.entityConfigs[obstacleType];

      let texture = "";
      let useTexture = true;
      
      switch (obstacle.type) {
        case 'small-barrier':
          texture = "small-barrier";
          break;
        case 'large-barrier':
          texture = "large-barrier";
          break;
        case 'floating-barrier':
          texture = "floating-barrier";
          break;
        case 'hole':
          texture = "hole";
          break;
        default: // no texture for coins
          useTexture = false;
      }

      this.renderEntity({
        position: obstacle.position,
        scale: obstacle.size,
        useTexture: useTexture,
        textureName: texture,
        ...config,})
      
    }
  }
  
  /**
   * Render the ground
   */
  private renderGround(): void {
    const groundPosition = new Vector3(0, -1.4, 0);
    const groundScale = new Vector3(150, 0.4, 180);
    const textureOffset = [0.22, this.groundTextureOffset];
    
    this.renderEntity({
      position: groundPosition,
      scale: groundScale,
      useTexture: true,
      textureName: 'ground',
      textureOffset: textureOffset,
      ...this.entityConfigs.ground
    });
  }

  private renderLaneBorders(): void {
    const laneCount = this.getHardDifficulty() ? 5 : 3;
    const laneBorders = getLaneBorderPositions(laneCount);
    const borderScale = new Vector3(0.05, 0.05, 180);

    for (let i = 0; i < laneBorders.length; i++) {
      this.renderEntity({
        position: laneBorders[i],
        scale: borderScale,
        useTexture: true,
        textureName: "laneBorder",
        ...this.entityConfigs.laneBorders
      });
    }
  }
  
  /**
   * Set texture for rendering
   */
  private setTexture(textureName: string | undefined, useTexture: boolean): boolean {
    // Skip if texture not requested
    if (!useTexture || !textureName) {
      this.gl.uniform1i(this.uniformLocations.u_useTexture, 0);
      return false;
    }
    
    // Get texture from manager
    const texture = this.textureManager.getTexture(textureName);
    if (!texture) {
      console.warn(`Texture "${textureName}" not found!`);
      this.gl.uniform1i(this.uniformLocations.u_useTexture, 0);
      return false;
    }
    
    // Set texture uniforms
    this.gl.uniform1i(this.uniformLocations.u_useTexture, 1);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(this.uniformLocations.uTexture, 0);
    
    return true;
  }
  
  /**
   * Render a generic entity with options
   */
  private renderEntity(options: RenderOptions): void {
    const {
      position,
      scale,
      rotation,
      useTexture = false,
      textureName,
      textureOffset = [0, 0],
      color
    } = options;
    
    // Set entity color (use provided or default)
    this.gl.uniform3fv(this.uniformLocations.diffuseColor, color || [1, 1, 1]);
    
    // Handle texture setup
    this.setTexture(textureName, useTexture);
    
    // Set texture offset
    this.gl.uniform2fv(this.uniformLocations.u_textureOffset, textureOffset);
    
    // Create model-view matrix with rotation if provided
    const modelViewMatrix = createModelViewMatrix(
      this.viewMatrix, 
      {x: position.x, y: position.y, z: position.z}, 
      scale ? {x: scale.x, y: scale.y, z: scale.z} : undefined,
      rotation
    );
    
    // Set model-view matrix uniform
    this.gl.uniformMatrix4fv(this.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    
    // Calculate and set normal matrix
    const nMatrix = normalMatrix(modelViewMatrix);
    this.gl.uniformMatrix4fv(this.uniformLocations.normalMatrix, false, nMatrix);
    
    // Draw with appropriate geometry
    const geometry = options.geometry || 'cube';
    if (geometry === 'sphere') {
      drawGeometry(this.gl, this.sphereGeometry);
    } else {
      drawGeometry(this.gl, this.cubeGeometry);
    }
  }
}

const getLaneBorderPositions = (laneCount: number) => {
  let positions: Vector3[] = [];

  for (let i = 0; i <= Math.floor(laneCount / 2) * 3; i += 3) {
    const xPos = i + 1.5;
    const left = new Vector3(-xPos, -0.9, 0);
    const right = new Vector3(xPos, -0.9, 0);
    positions.push(left, right);
  }
  return positions;
}