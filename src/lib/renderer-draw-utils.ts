import { cube_vertices, cube_indices, cube_normals, cube_texCoords } from "./geometry_data/cube_data";
import { sphere_vertices, sphere_indices, sphere_normals, sphere_texCoords } from "./geometry_data/sphere_data";

// Buffer configuration object
export interface GeometryBuffers {
  vertex: WebGLBuffer | null;
  normal: WebGLBuffer | null;
  texCoord: WebGLBuffer | null;
  index: WebGLBuffer | null;
  indexCount: number;
}

// Interface for attribute locations
export interface AttributeLocations {
  position: number;
  normal: number;
  texCoord: number;
}

/**
 * Create cube geometry and return buffer objects
 */
export function createCubeGeometry(gl: WebGL2RenderingContext): GeometryBuffers {
  // Define cube vertices (positions)
  const vertices = cube_vertices;
  
  // Define normals for lighting
  const normals = cube_normals;
  
  // Define texture coordinates
  const texCoords = cube_texCoords;
  
  // Define indices for the cube
  const indices = cube_indices;

  // Create and bind vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  // Create and bind normal buffer
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  
  // Create and bind texture coordinate buffer
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  
  // Create and bind index buffer
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  return {
    vertex: vertexBuffer,
    normal: normalBuffer,
    texCoord: texCoordBuffer,
    index: indexBuffer,
    indexCount: indices.length
  };
}

/**
 * Create sphere geometry and return buffer objects
 */
export function createSphereGeometry(gl: WebGL2RenderingContext): GeometryBuffers {
  // Use the sphere data
  const vertices = sphere_vertices;
  const normals = sphere_normals;
  const texCoords = sphere_texCoords;
  const indices = sphere_indices;

  // Create and bind vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  // Create and bind normal buffer
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  
  // Create and bind texture coordinate buffer
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  
  // Create and bind index buffer
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  return {
    vertex: vertexBuffer,
    normal: normalBuffer,
    texCoord: texCoordBuffer,
    index: indexBuffer,
    indexCount: indices.length
  };
}

/**
 * Draw a cube using the current bind buffers
 */
export function drawCube(
  gl: WebGL2RenderingContext, 
  cubeGeometry: GeometryBuffers, 
  attribLocations: AttributeLocations
): void {
  const { vertex, normal, texCoord, index, indexCount } = cubeGeometry;
  
  if (!vertex || !normal || !texCoord || !index) return;
  
  // Bind position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex);
  gl.vertexAttribPointer(
    attribLocations.position,
    3,              // 3 components per vertex
    gl.FLOAT,       // type of data
    false,          // don't normalize
    0,              // stride (0 = auto)
    0               // offset
  );
  gl.enableVertexAttribArray(attribLocations.position);
  
  // Bind normal buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, normal);
  gl.vertexAttribPointer(
    attribLocations.normal,
    3,              // 3 components per normal
    gl.FLOAT,       // type of data
    false,          // don't normalize
    0,              // stride (0 = auto)
    0               // offset
  );
  gl.enableVertexAttribArray(attribLocations.normal);
  
  // Bind texture coordinate buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoord);
  gl.vertexAttribPointer(
    attribLocations.texCoord,
    2,              // 2 components per texture coord
    gl.FLOAT,       // type of data
    false,          // don't normalize
    0,              // stride (0 = auto)
    0               // offset
  );
  gl.enableVertexAttribArray(attribLocations.texCoord);
  
  // Bind index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
  
  // Draw the cube
  gl.drawElements(
    gl.TRIANGLES,
    indexCount,
    gl.UNSIGNED_SHORT,
    0
  );
}

/**
 * Draw a sphere using the sphere buffers
 */
export function drawSphere(
  gl: WebGL2RenderingContext, 
  sphereGeometry: GeometryBuffers, 
  attribLocations: AttributeLocations
): void {
  const { vertex, normal, texCoord, index, indexCount } = sphereGeometry;
  
  if (!vertex || !normal || !texCoord || !index) return;
  
  // Bind position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex);
  gl.vertexAttribPointer(
    attribLocations.position,
    3,              // 3 components per vertex
    gl.FLOAT,       // type of data
    false,          // don't normalize
    0,              // stride (0 = auto)
    0               // offset
  );
  gl.enableVertexAttribArray(attribLocations.position);
  
  // Bind normal buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, normal);
  gl.vertexAttribPointer(
    attribLocations.normal,
    3,              // 3 components per normal
    gl.FLOAT,       // type of data
    false,          // don't normalize
    0,              // stride (0 = auto)
    0               // offset
  );
  gl.enableVertexAttribArray(attribLocations.normal);
  
  // Bind texture coordinate buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoord);
  gl.vertexAttribPointer(
    attribLocations.texCoord,
    2,              // 2 components per texture coord
    gl.FLOAT,       // type of data
    false,          // don't normalize
    0,              // stride (0 = auto)
    0               // offset
  );
  gl.enableVertexAttribArray(attribLocations.texCoord);
  
  // Bind index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
  
  // Draw the sphere
  gl.drawElements(
    gl.TRIANGLES,
    indexCount,
    gl.UNSIGNED_SHORT,
    0
  );
}
