import React from 'react';
import { mat3, mat4 } from 'gl-matrix';

/**
 * Creates a force update hook for React components
 * @returns Function to force component update
 */
export function useForceUpdate() {
  const [, setTick] = React.useState(0);
  return React.useCallback(() => {
    setTick((tick) => tick + 1);
  }, []);
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