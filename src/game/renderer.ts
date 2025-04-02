import { Player } from './player';
import { Vector3 } from '@math.gl/core';
import { normalMatrix } from '@/utility';
import { 
  createPerspectiveMatrix, 
  createViewMatrix, 
  createModelViewMatrix 
} from '@/lib/matrix-utils';
import { TextureManager } from '@/lib/texture-manager';
import { 
  drawCube, 
  drawSphere, 
  createCubeGeometry, 
  createSphereGeometry, 
  GeometryBuffers, 
  AttributeLocations 
} from '../lib/renderer-draw-utils';

export interface Obstacle {
  position: Vector3;
  scale?: Vector3;
  size?: Vector3;
  type: string;
}

// Entity rendering configuration
interface RenderConfig {
  color: number[];
  scale?: Vector3;
  geometry?: 'cube' | 'sphere';
  useTexture?: boolean;
  textureName?: string;
  textureOffset?: number[]; // Add texture offset for scrolling ground
  rotation?: number; // Add rotation parameter
}

export class Renderer {
  // Shader locations
  private attribLocations: AttributeLocations & { [key: string]: number } = {
    position: 0,
    normal: 0,
    texCoord: 0
  };
  private uniformLocations: { [key: string]: WebGLUniformLocation | null } = {};
  
  // Geometry buffers
  private cubeGeometry: GeometryBuffers;
  private sphereGeometry: GeometryBuffers;
  
  // Matrices
  private projectionMatrix: Float32Array;
  private viewMatrix: Float32Array;
  
  // Texture manager
  private textureManager: TextureManager;
  
  // Ground tracking
  private groundPosition: number = 0;
  private groundTextureOffset: number = 0;
  
  // Rendering configurations
  private readonly entityConfigs = {
    player: { color: [1, 1, 1.0], geometry: 'sphere' },
    barrier: { color: [0.8, 0.2, 0.2] },
    obstacle: { color: [0.1, 0.1, 0.1] },
    ground: { color: [1, 1, 1] },
    hole: { color: [0.05, 0.05, 0.05], geometry: 'sphere' } // Add specific config for holes
  };
  
  // Light configuration
  private readonly lightPosition = [5, 10, 5];
  
  constructor(
    private gl: WebGL2RenderingContext, 
    private shaderProgram: WebGLProgram
  ) {
    // Initialize texture manager
    this.textureManager = new TextureManager(gl);
    
    // Initialize matrices
    this.projectionMatrix = new Float32Array(16);
    this.viewMatrix = new Float32Array(16);
    
    // Initialize rendering pipeline
    this.setupShaderLocations();
    this.cubeGeometry = createCubeGeometry(this.gl);
    this.sphereGeometry = createSphereGeometry(this.gl);
    this.initializeRenderState();
    
    // Set initial projection matrix
    this.updateProjection(this.gl.canvas.width / this.gl.canvas.height);
  }
  
  /**
   * Load textures for the game
   */
  public async loadTextures(): Promise<void> {
    await this.textureManager.loadTextures([
      { name: 'player', url: '/assets/textures/woodplank_ball.png' },
      { name: 'ground', url: '/assets/textures/brick_floor.jpg' }
    ]);
  }
  
  /**
   * Update ground position for scrolling effect
   */
  public updateGroundPosition(delta: number, gameSpeed: number): void {
    // Update ground position for scrolling effect
    this.groundPosition += delta * gameSpeed; // Adjust multiplier for scroll speed
    
    // Update texture offset for scrolling ground texture
    // Add a scaling factor (0.5) to match obstacle movement speed
    const textureScrollFactor = 0.05;
    this.groundTextureOffset += delta * gameSpeed * textureScrollFactor;
    
    // Reset when it gets too large to avoid floating point precision issues
    if (this.groundTextureOffset > 100) {
      this.groundTextureOffset = 0;
    }
  }
  
  /**
   * Set up attribute and uniform locations from shader program
   */
  private setupShaderLocations(): void {
    // Get attribute locations
    this.attribLocations = {
      position: this.gl.getAttribLocation(this.shaderProgram, 'position'),
      normal: this.gl.getAttribLocation(this.shaderProgram, 'normal'),
      texCoord: this.gl.getAttribLocation(this.shaderProgram, 'texCoord')
    };
    
    // Get uniform locations
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
    // Enable depth testing
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LESS);
  }
  
  /**
   * Update projection matrix based on aspect ratio
   */
  public updateProjection(aspectRatio: number): void {
    // Set up a perspective projection
    const fieldOfView = (45 * Math.PI) / 180; // 45 degrees in radians
    const near = 0.1;
    const far = 100.0;
    
    // Calculate perspective projection matrix using our utility
    this.projectionMatrix = createPerspectiveMatrix(fieldOfView, aspectRatio, near, far);
    
    this.updateViewMatrix();
  }
  
  /**
   * Update the view matrix (camera position)
   */
  private updateViewMatrix(): void {
    // Camera parameters
    const eye = [0, 10, 20]; // Camera position: higher and further back
    const center = [0, 5, 0]; // Look slightly ahead of the player
    const up = [0, 1, 0]; // Up direction
    
    // Calculate view matrix using our utility
    this.viewMatrix = createViewMatrix(eye, center, up);
  }
  
  /**
   * Main render method
   */
  public render(player: Player, obstacles: Obstacle[]): void {
    this.initializeFrame();
    this.renderGround();
    this.renderObstacles(obstacles);
    this.renderPlayer(player);
  }
  
  /**
   * Initialize frame for rendering
   */
  private initializeFrame(): void {
    // Clear buffers
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Use shader program
    this.gl.useProgram(this.shaderProgram);
    
    // Set common uniforms
    this.gl.uniform3fv(this.uniformLocations.lightPosition, this.lightPosition);
    this.gl.uniformMatrix4fv(
      this.uniformLocations.projectionMatrix,
      false,
      this.projectionMatrix
    );
  }
  
  /**
   * Render the player entity
   */
  private renderPlayer(player: Player): void {
    const config: RenderConfig = {
      ...this.entityConfigs.player,
      useTexture: true,
      textureName: 'player',
      rotation: player.rotation // Pass player's rotation to renderEntity
    };
    
    // Render player as a sphere at position
    this.renderEntity(player.position, config);
  }
  
  /**
   * Render all obstacles
   */
  private renderObstacles(obstacles: Obstacle[]): void {
    for (const obstacle of obstacles) {
      let config;
      
      // Determine the appropriate configuration based on obstacle type
      if (obstacle.type === 'hole') {
        config = this.entityConfigs.hole;
      } else if (obstacle.type === 'barrier') {
        config = this.entityConfigs.barrier;
      } else {
        config = this.entityConfigs.obstacle;
      }
      
      // Apply specific adjustments for hole obstacles
      if (obstacle.type === 'hole') {
        // Create a flattened sphere for the hole
        const holePosition = new Vector3([
          obstacle.position[0],
          obstacle.position[1] + 0.05, // Raise slightly to be visible on ground
          obstacle.position[2]
        ]);
        
        // Use the obstacle's width for diameter, but make it very flat
        const holeScale = new Vector3([
          obstacle.size?.[0] || 1.5,
          0.1, // Very flat
          obstacle.size?.[2] || 1.5
        ]);
        
        // Render the hole
        this.renderEntity(holePosition, {
          ...config,
          scale: holeScale
        });
      } else {
        // Render regular obstacle with appropriate configuration
        this.renderEntity(obstacle.position, {
          ...config,
          scale: obstacle.size || obstacle.scale
        });
      }
    }
  }
  
  /**
   * Render the ground
   */
  private renderGround(): void {
    // Calculate ground position based on scrolling
    const groundPosition = new Vector3(0, -3, 0);
    const groundScale = new Vector3(50, 0.4, 100);
    
    // Define texture offset for scrolling ground (using Z direction for forward movement)
    const textureOffset = [0, this.groundTextureOffset]; // Second value controls forward scrolling
    
    this.renderEntity(groundPosition, {
      ...this.entityConfigs.ground,
      scale: groundScale,
      useTexture: true,
      textureName: 'ground',
      textureOffset: textureOffset
    });
  }
  
  /**
   * Render a generic entity with position and configuration
   */
  private renderEntity(position: Vector3, config: RenderConfig): void {
    // Set entity color
    this.gl.uniform3fv(this.uniformLocations.diffuseColor, config.color);
    
    // Handle textures
    const useTexture = config.useTexture && config.textureName && 
                      this.textureManager.getTexture(config.textureName);
    
    this.gl.uniform1i(this.uniformLocations.u_useTexture, useTexture ? 1 : 0);
    
    // Set texture offset if provided (for scrolling textures)
    if (config.textureOffset) {
      this.gl.uniform2fv(this.uniformLocations.u_textureOffset, config.textureOffset);
    } else {
      this.gl.uniform2fv(this.uniformLocations.u_textureOffset, [0, 0]);
    }
    
    if (useTexture && config.textureName) {
      const texture = this.textureManager.getTexture(config.textureName);
      if (texture) {
        // Activate texture unit 0
        this.gl.activeTexture(this.gl.TEXTURE0);
        // Bind the texture
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        // Tell the shader to use texture unit 0
        this.gl.uniform1i(this.uniformLocations.uTexture, 0);
      }
    }
    
    // Create model-view matrix with rotation if provided
    const modelViewMatrix = createModelViewMatrix(
      this.viewMatrix, 
      {x: position.x, y: position.y, z: position.z}, 
      config.scale ? {x: config.scale.x, y: config.scale.y, z: config.scale.z} : undefined,
      config.rotation // Pass rotation to matrix creation function
    );
    
    // Set model-view matrix uniform
    this.gl.uniformMatrix4fv(
      this.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );
    
    // Calculate and set normal matrix
    const nMatrix = normalMatrix(modelViewMatrix);
    this.gl.uniformMatrix4fv(
      this.uniformLocations.normalMatrix,
      false,
      nMatrix
    );
    
    // Draw the entity with appropriate geometry
    if (config.geometry === 'sphere') {
      this.drawSphere();
    } else {
      this.drawCube();
    }
  }
  
  /**
   * Draw a cube using the current bind buffers
   */
  private drawCube(): void {
    drawCube(this.gl, this.cubeGeometry, this.attribLocations);
  }
  
  /**
   * Draw a sphere using the sphere buffers
   */
  private drawSphere(): void {
    drawSphere(this.gl, this.sphereGeometry, this.attribLocations);
  }
}