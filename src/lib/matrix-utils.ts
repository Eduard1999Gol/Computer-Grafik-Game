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
 * Creates a model-view matrix for an entity
 * @param viewMatrix The camera's view matrix
 * @param position Entity position
 * @param scale Entity scale (optional)
 * @returns Model-view matrix as Float32Array
 */
export function createModelViewMatrix(
  viewMatrix: Float32Array,
  position: { x: number; y: number; z: number },
  scale?: { x: number; y: number; z: number }
): Float32Array {
  const modelViewMatrix = new Float32Array(16);
  
  // Start with view matrix
  for (let i = 0; i < 16; i++) {
    modelViewMatrix[i] = viewMatrix[i];
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
