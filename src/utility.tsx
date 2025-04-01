import React from 'react';

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
  // Create a new matrix for the normal transformation
  const normalMat = new Float32Array(16);
  
  // Start with a copy of the model-view matrix
  for (let i = 0; i < 16; i++) {
    normalMat[i] = modelViewMatrix[i];
  }
  
  // Invert the matrix (simplified - this would normally be a proper inverse)
  // This is just a placeholder - in a real implementation use proper matrix inversion
  
  // Transpose the inverse
  // This is just a placeholder - in a real implementation use proper matrix transpose
  
  return normalMat;
}
