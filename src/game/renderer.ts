import { Player } from './player';
import { Vector3 } from '@math.gl/core';
import { normalMatrix } from '@/utility';
import { cube_vertices, cube_indices, cube_normals, cube_texCoords } from "./cube_data"

export interface Obstacle {
  position: Vector3;
  scale?: Vector3;
  type: string;
}

// Entity rendering configuration
interface RenderConfig {
  color: number[];
  scale?: Vector3;
}

// Buffer configuration object
interface GeometryBuffers {
  vertex: WebGLBuffer | null;
  normal: WebGLBuffer | null;
  texCoord: WebGLBuffer | null;
  index: WebGLBuffer | null;
  indexCount: number;
}

export class Renderer {
  // Camera and projection matrices
  private projectionMatrix: Float32Array;
  private viewMatrix: Float32Array;
  
  // Shader locations
  private attribLocations: { [key: string]: number } = {};
  private uniformLocations: { [key: string]: WebGLUniformLocation | null } = {};
  
  // Geometry buffers
  private cubeGeometry: GeometryBuffers;
  
  // Rendering configurations
  private readonly entityConfigs = {
    player: { color: [0.2, 0.6, 1.0] },
    barrier: { color: [0.8, 0.2, 0.2] },
    obstacle: { color: [0.1, 0.1, 0.1] },
    ground: { color: [0.3, 0.3, 0.3] }
  };
  
  // Light configuration
  private readonly lightPosition = [5, 10, 5];
  
  constructor(
    private gl: WebGL2RenderingContext, 
    private shaderProgram: WebGLProgram
  ) {
    // Initialize matrices
    this.projectionMatrix = new Float32Array(16);
    this.viewMatrix = new Float32Array(16);
    
    // Initialize rendering pipeline
    this.setupShaderLocations();
    this.cubeGeometry = this.createCubeGeometry();
    this.initializeRenderState();
    
    // Set initial projection matrix
    this.updateProjection(this.gl.canvas.width / this.gl.canvas.height);
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
      uTexture: this.gl.getUniformLocation(this.shaderProgram, 'uTexture')
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
   * Create cube geometry and return buffer objects
   */
  private createCubeGeometry(): GeometryBuffers {
    // Define cube vertices (positions)
    const vertices = cube_vertices
    
    // Define normals for lighting
    const normals = cube_normals
    
    // Define texture coordinates
    const texCoords = cube_texCoords
    
    // Define indices for the cube
    const indices = cube_indices

    // Create and bind vertex buffer
    const vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
    // Create and bind normal buffer
    const normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);
    
    // Create and bind texture coordinate buffer
    const texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
    
    // Create and bind index buffer
    const indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
    
    return {
      vertex: vertexBuffer,
      normal: normalBuffer,
      texCoord: texCoordBuffer,
      index: indexBuffer,
      indexCount: indices.length
    };
  }
  
  /**
   * Update projection matrix based on aspect ratio
   */
  public updateProjection(aspectRatio: number): void {
    // Set up a perspective projection
    const fieldOfView = (45 * Math.PI) / 180; // 45 degrees in radians
    const near = 0.1;
    const far = 100.0;
    
    // Calculate perspective projection matrix
    const f = 1.0 / Math.tan(fieldOfView / 2);
    const rangeInv = 1 / (near - far);
    
    this.projectionMatrix[0] = f / aspectRatio;
    this.projectionMatrix[1] = 0;
    this.projectionMatrix[2] = 0;
    this.projectionMatrix[3] = 0;
    this.projectionMatrix[4] = 0;
    this.projectionMatrix[5] = f;
    this.projectionMatrix[6] = 0;
    this.projectionMatrix[7] = 0;
    this.projectionMatrix[8] = 0;
    this.projectionMatrix[9] = 0;
    this.projectionMatrix[10] = (far + near) * rangeInv;
    this.projectionMatrix[11] = -1;
    this.projectionMatrix[12] = 0;
    this.projectionMatrix[13] = 0;
    this.projectionMatrix[14] = 2 * far * near * rangeInv;
    this.projectionMatrix[15] = 0;
    
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
    
    // Calculate view matrix
    const z = this.normalizeVector(this.subtractVectors(eye, center));
    const x = this.normalizeVector(this.crossVectors(up, z));
    const y = this.normalizeVector(this.crossVectors(z, x));
    
    this.viewMatrix[0] = x[0];
    this.viewMatrix[1] = y[0];
    this.viewMatrix[2] = z[0];
    this.viewMatrix[3] = 0;
    this.viewMatrix[4] = x[1];
    this.viewMatrix[5] = y[1];
    this.viewMatrix[6] = z[1];
    this.viewMatrix[7] = 0;
    this.viewMatrix[8] = x[2];
    this.viewMatrix[9] = y[2];
    this.viewMatrix[10] = z[2];
    this.viewMatrix[11] = 0;
    this.viewMatrix[12] = -this.dotVectors(x, eye);
    this.viewMatrix[13] = -this.dotVectors(y, eye);
    this.viewMatrix[14] = -this.dotVectors(z, eye);
    this.viewMatrix[15] = 1;
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
    const config = this.entityConfigs.player;
    const position = player.position || new Vector3(0, 0, 0);
    
    // Render player cube at position
    this.renderEntity(position, config);
  }
  
  /**
   * Render all obstacles
   */
  private renderObstacles(obstacles: Obstacle[]): void {
    for (const obstacle of obstacles) {
      const config = obstacle.type === 'barrier' 
        ? this.entityConfigs.barrier 
        : this.entityConfigs.obstacle;
      
      // Render obstacle with appropriate configuration
      this.renderEntity(obstacle.position, {
        ...config,
        scale: obstacle.scale
      });
    }
  }
  
  /**
   * Render the ground
   */
  private renderGround(): void {
    // Placeholder for ground rendering
    const groundPosition = new Vector3(0, -2, 0);
    const groundScale = new Vector3(20, 0.1, 100);
    
    this.renderEntity(groundPosition, {
      ...this.entityConfigs.ground,
      scale: groundScale
    });
  }
  
  /**
   * Render a generic entity with position and configuration
   */
  private renderEntity(position: Vector3, config: RenderConfig): void {
    // Set entity color
    this.gl.uniform3fv(this.uniformLocations.diffuseColor, config.color);
    
    // Create model-view matrix
    const modelViewMatrix = this.createModelViewMatrix(position, config.scale);
    
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
    
    // Draw the entity
    this.drawCube();
  }
  
  /**
   * Create model-view matrix for an entity
   */
  private createModelViewMatrix(position: Vector3, scale?: Vector3): Float32Array {
    const modelViewMatrix = new Float32Array(16);
    
    // Start with view matrix
    for (let i = 0; i < 16; i++) {
      modelViewMatrix[i] = this.viewMatrix[i];
    }
    
    // Apply position transformation
    modelViewMatrix[12] += position.x;
    modelViewMatrix[13] += position.y;
    modelViewMatrix[14] += position.z;
    
    // Apply scale if provided
    if (scale) {
      // Note: This is a simplified approach. A proper implementation would
      // use full matrix multiplication for accurate scaling
      modelViewMatrix[0] *= scale.x;
      modelViewMatrix[5] *= scale.y;
      modelViewMatrix[10] *= scale.z;
    }
    
    return modelViewMatrix;
  }
  
  /**
   * Draw a cube using the current bind buffers
   */
  private drawCube(): void {
    const { vertex, normal, texCoord, index, indexCount } = this.cubeGeometry;
    
    if (!vertex || !normal || !texCoord || !index) return;
    
    // Bind position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex);
    this.gl.vertexAttribPointer(
      this.attribLocations.position,
      3,              // 3 components per vertex
      this.gl.FLOAT,  // type of data
      false,          // don't normalize
      0,              // stride (0 = auto)
      0               // offset
    );
    this.gl.enableVertexAttribArray(this.attribLocations.position);
    
    // Bind normal buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normal);
    this.gl.vertexAttribPointer(
      this.attribLocations.normal,
      3,              // 3 components per normal
      this.gl.FLOAT,  // type of data
      false,          // don't normalize
      0,              // stride (0 = auto)
      0               // offset
    );
    this.gl.enableVertexAttribArray(this.attribLocations.normal);
    
    // Bind texture coordinate buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoord);
    this.gl.vertexAttribPointer(
      this.attribLocations.texCoord,
      2,              // 2 components per texture coord
      this.gl.FLOAT,  // type of data
      false,          // don't normalize
      0,              // stride (0 = auto)
      0               // offset
    );
    this.gl.enableVertexAttribArray(this.attribLocations.texCoord);
    
    // Bind index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index);
    
    // Draw the cube
    this.gl.drawElements(
      this.gl.TRIANGLES,
      indexCount,
      this.gl.UNSIGNED_SHORT,
      0
    );
  }
  
  // Vector helper methods
  private normalizeVector(v: number[]): number[] {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.00001) {
      return [v[0] / length, v[1] / length, v[2] / length];
    }
    return [0, 0, 0];
  }
  
  private subtractVectors(a: number[], b: number[]): number[] {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }
  
  private crossVectors(a: number[], b: number[]): number[] {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }
  
  private dotVectors(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
}