import { Player } from './player';
import { Vector3 } from '@math.gl/core';
import { normalMatrix } from '@/utility';

export class Renderer {
  private projectionMatrix: Float32Array;
  private viewMatrix: Float32Array;
  
  // Shader locations
  private attribLocations: { [key: string]: number } = {};
  private uniformLocations: { [key: string]: WebGLUniformLocation | null } = {};
  
  // Geometry buffers
  private cubeVertexBuffer: WebGLBuffer | null = null;
  private cubeNormalBuffer: WebGLBuffer | null = null;
  private cubeTexCoordBuffer: WebGLBuffer | null = null;
  private cubeIndexBuffer: WebGLBuffer | null = null;
  private cubeIndexCount: number = 0;
  
  constructor(
    private gl: WebGL2RenderingContext, 
    private shaderProgram: WebGLProgram
  ) {
    // Initialize matrices
    this.projectionMatrix = new Float32Array(16);
    this.viewMatrix = new Float32Array(16);
    
    // Set up attribute and uniform locations
    this.setupShaderLocations();
    
    // Create geometry
    this.createGeometry();
    
    // Set initial projection matrix
    this.updateProjection(this.gl.canvas.width / this.gl.canvas.height);
  }
  
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
  
  private createGeometry(): void {
    // Define cube vertices (positions)
    const vertices = new Float32Array([
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      
      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,
      
      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,
      
      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
      
      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,
      
      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
    ]);
    
    // Define normals for lighting
    const normals = new Float32Array([
      // Front face
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
      
      // Back face
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
      
      // Top face
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
      
      // Bottom face
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
      
      // Right face
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
      
      // Left face
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0
    ]);
    
    // Define texture coordinates
    const texCoords = new Float32Array([
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      
      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      
      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      
      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      
      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      
      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ]);
    
    // Define indices for the cube
    const indices = new Uint16Array([
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23    // left
    ]);
    this.cubeIndexCount = indices.length;
    
    // Create and bind vertex buffer
    this.cubeVertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
    // Create and bind normal buffer
    this.cubeNormalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeNormalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);
    
    // Create and bind texture coordinate buffer
    this.cubeTexCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeTexCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
    
    // Create and bind index buffer
    this.cubeIndexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.cubeIndexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
  }
  
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
    
    // Update the view matrix (camera position)
    const eye = [0, 5, 10]; // Camera position
    const center = [0, 0, 0]; // Point to look at
    const up = [0, 1, 0]; // Up direction
    
    // Simple view matrix calculation
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
  
  // Vector helper functions
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
  
  public render(player: Player, obstacles: any[]): void {
    // Use the shader program
    this.gl.useProgram(this.shaderProgram);
    
    // Set up common uniforms
    this.gl.uniform3f(this.uniformLocations.lightPosition, 10, 10, -10);
    
    // Bind projection matrix
    this.gl.uniformMatrix4fv(
      this.uniformLocations.projectionMatrix,
      false,
      this.projectionMatrix
    );
    
    // Render the player
    this.renderPlayer(player);
    
    // Render obstacles
    this.renderObstacles(obstacles);
    
    // Render the ground/track
    this.renderGround();
  }
  
  private renderPlayer(player: Player): void {
    // Set player color
    this.gl.uniform3f(this.uniformLocations.diffuseColor, 0.2, 0.6, 1.0);
    
    // Compute model-view matrix for player
    const modelViewMatrix = new Float32Array(16);
    // Start with the view matrix
    for (let i = 0; i < 16; i++) {
      modelViewMatrix[i] = this.viewMatrix[i];
    }
    
    // Apply player position and scale
    // In a real game, you'd use player.position, but for our test cube:
    const position = player.position || new Vector3(0, 0, 0);
    
    // Apply translation
    modelViewMatrix[12] += position.x;
    modelViewMatrix[13] += position.y;
    modelViewMatrix[14] += position.z;
    
    // Set uniforms and draw the player
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
    
    // Draw the player
    this.drawCube();
  }
  
  private renderObstacles(obstacles: any[]): void {
    // For each obstacle, compute its matrix and render it
    for (const obstacle of obstacles) {
      // Set obstacle color based on type
      if (obstacle.type === 'barrier') {
        this.gl.uniform3f(this.uniformLocations.diffuseColor, 0.8, 0.2, 0.2);
      } else {
        this.gl.uniform3f(this.uniformLocations.diffuseColor, 0.1, 0.1, 0.1);
      }
      
      // Compute model-view matrix for obstacle
      const modelViewMatrix = new Float32Array(16);
      // In a real implementation, this would compute proper model-view matrix
      
      // Set uniforms and draw the obstacle
      this.gl.uniformMatrix4fv(
        this.uniformLocations.modelViewMatrix,
        false, 
        modelViewMatrix
      );
      
      // Draw the obstacle
      this.drawCube();
    }
  }
  
  private renderGround(): void {
    // Set ground color
    this.gl.uniform3f(this.uniformLocations.diffuseColor, 0.3, 0.3, 0.3);
    
    // Compute model-view matrix for ground
    const modelViewMatrix = new Float32Array(16);
    // In a real implementation, this would compute proper model-view matrix
    
    // Set uniforms and draw the ground
    this.gl.uniformMatrix4fv(
      this.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );
    
    // Draw the ground (simplified)
    this.drawCube();
  }
  
  private drawCube(): void {
    if (!this.cubeVertexBuffer || !this.cubeNormalBuffer || 
        !this.cubeTexCoordBuffer || !this.cubeIndexBuffer) return;
    
    // Bind position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexBuffer);
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
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeNormalBuffer);
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
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeTexCoordBuffer);
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
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.cubeIndexBuffer);
    
    // Draw the cube
    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.cubeIndexCount,
      this.gl.UNSIGNED_SHORT,
      0
    );
  }
}
