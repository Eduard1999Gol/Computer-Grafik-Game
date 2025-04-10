import { cube_vertices, cube_indices, cube_normals, cube_texCoords } from "./geometry_data/cube_data";
import { sphere_vertices, sphere_indices, sphere_normals, sphere_texCoords } from "./geometry_data/sphere_data";


export interface GeometryVAO {
  vao: WebGLVertexArrayObject;
  indexCount: number;
}

// Interface for attribute locations
export interface AttributeLocations {
  position: number;
  normal: number;
  texCoord: number;
}

// Create geometry vao for a cube (sphere = false) or sphere (sphere = true)
export function createGeometry(gl: WebGL2RenderingContext, attribLocations: AttributeLocations, sphere: boolean): GeometryVAO {
  const vertices = sphere ? sphere_vertices : cube_vertices;
  const normals = sphere ? sphere_normals : cube_normals;
  const texCoords = sphere ? sphere_texCoords : cube_texCoords;
  const indices = sphere ? sphere_indices : cube_indices;

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribLocations.position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribLocations.position);
  
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribLocations.normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribLocations.normal);
  
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribLocations.texCoord);
  
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
  
  return {vao: vao, indexCount: indices.length};
}

export function drawGeometry(gl: WebGL2RenderingContext, geometryVAO: GeometryVAO): void {
  gl.bindVertexArray(geometryVAO.vao);
  gl.drawElements(gl.TRIANGLES, geometryVAO.indexCount, gl.UNSIGNED_SHORT, 0)
  gl.bindVertexArray(null);
}
