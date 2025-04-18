import { mat3, mat4 } from 'gl-matrix';
/**
 * Matrix utility functions for 3D graphics
 */

/**
 * Creates a perspective projection matrix
 * @param fieldOfView Field of view in radians
 * @param aspectRatio Aspect ratio (width/height)
 * @param near Near clipping plane
 * @param far Far clipping plane
 * @returns Perspective projection matrix as Float32Array
 */
export function createPerspectiveMatrix(
  fieldOfView: number,
  aspectRatio: number,
  near: number,
  far: number
): Float32Array {
  const projectionMatrix = new Float32Array(16);
  const f = 1.0 / Math.tan(fieldOfView / 2);
  const rangeInv = 1 / (near - far);

  projectionMatrix[0] = f / aspectRatio;
  projectionMatrix[1] = 0;
  projectionMatrix[2] = 0;
  projectionMatrix[3] = 0;
  projectionMatrix[4] = 0;
  projectionMatrix[5] = f;
  projectionMatrix[6] = 0;
  projectionMatrix[7] = 0;
  projectionMatrix[8] = 0;
  projectionMatrix[9] = 0;
  projectionMatrix[10] = (far + near) * rangeInv;
  projectionMatrix[11] = -1;
  projectionMatrix[12] = 0;
  projectionMatrix[13] = 0;
  projectionMatrix[14] = 2 * far * near * rangeInv;
  projectionMatrix[15] = 0;

  return projectionMatrix;
}

/**
 * Creates a view matrix (camera)
 * @param eye Camera position
 * @param center Look-at position
 * @param up Up vector
 * @returns View matrix as Float32Array
 */
export function createViewMatrix(
  eye: number[],
  center: number[],
  up: number[]
): Float32Array {
  const viewMatrix = new Float32Array(16);
  
  // Calculate view matrix
  const z = normalizeVector(subtractVectors(eye, center));
  const x = normalizeVector(crossVectors(up, z));
  const y = normalizeVector(crossVectors(z, x));
  
  viewMatrix[0] = x[0];
  viewMatrix[1] = y[0];
  viewMatrix[2] = z[0];
  viewMatrix[3] = 0;
  viewMatrix[4] = x[1];
  viewMatrix[5] = y[1];
  viewMatrix[6] = z[1];
  viewMatrix[7] = 0;
  viewMatrix[8] = x[2];
  viewMatrix[9] = y[2];
  viewMatrix[10] = z[2];
  viewMatrix[11] = 0;
  viewMatrix[12] = -dotVectors(x, eye);
  viewMatrix[13] = -dotVectors(y, eye);
  viewMatrix[14] = -dotVectors(z, eye);
  viewMatrix[15] = 1;
  
  return viewMatrix;
}

/**
 * Creates model-view matrix by translating, scaling and rotating
 */
export function createModelViewMatrix(
  viewMatrix: Float32Array, 
  position: { x: number, y: number, z: number },
  scale?: { x: number, y: number, z: number },
  rotation?: number
): Float32Array {
  const modelViewMatrix = mat4.create();
  
  mat4.copy(modelViewMatrix, viewMatrix);
  
  mat4.translate(modelViewMatrix, modelViewMatrix, [position.x, position.y, position.z]);
  
  if (rotation !== undefined) {
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation);
  }
  
  if (scale) {
    mat4.scale(modelViewMatrix, modelViewMatrix, [scale.x, scale.y, scale.z]);
  }
  
  return modelViewMatrix as Float32Array;
}



/**
 * Calculates the normal matrix from a model-view matrix
 * @param modelViewMatrix The model-view matrix
 * @returns The normal matrix as a Float32Array
 */

export function normalMatrix(modelViewMatrix: Float32Array): Float32Array {
  const normalMat3 = mat3.create();

  // upper 3x3 part of modelViewMatrix
  mat3.fromMat4(normalMat3, modelViewMatrix);

  mat3.invert(normalMat3, normalMat3);
  mat3.transpose(normalMat3, normalMat3);

  const normalMat4 = new Float32Array(16);
  normalMat4[0] = normalMat3[0];
  normalMat4[1] = normalMat3[1];
  normalMat4[2] = normalMat3[2];

  normalMat4[4] = normalMat3[3];
  normalMat4[5] = normalMat3[4];
  normalMat4[6] = normalMat3[5];

  normalMat4[8] = normalMat3[6];
  normalMat4[9] = normalMat3[7];
  normalMat4[10] = normalMat3[8];

  normalMat4[15] = 1;

  return normalMat4;
}

// Vector helper methods
export function normalizeVector(v: number[]): number[] {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  }
  return [0, 0, 0];
}

export function subtractVectors(a: number[], b: number[]): number[] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function crossVectors(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

export function dotVectors(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

