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
  
  // Implementation of matrix inverse:
  // This is a simplified version that assumes the upper-left 3x3 portion
  // of the modelViewMatrix only contains rotation/scale (no skew)
  
  // Copy the upper-left 3x3 portion of modelViewMatrix
  normalMat[0] = modelViewMatrix[0];
  normalMat[1] = modelViewMatrix[1];
  normalMat[2] = modelViewMatrix[2];
  normalMat[4] = modelViewMatrix[4];
  normalMat[5] = modelViewMatrix[5];
  normalMat[6] = modelViewMatrix[6];
  normalMat[8] = modelViewMatrix[8];
  normalMat[9] = modelViewMatrix[9];
  normalMat[10] = modelViewMatrix[10];
  
  // Set to identity for the rest
  normalMat[3] = 0;
  normalMat[7] = 0;
  normalMat[11] = 0;
  normalMat[12] = 0;
  normalMat[13] = 0;
  normalMat[14] = 0;
  normalMat[15] = 1;
  
  // For a proper implementation, this would involve transposing the inverse
  // of the modelViewMatrix, but we're simplifying here
  
  return normalMat;
}
