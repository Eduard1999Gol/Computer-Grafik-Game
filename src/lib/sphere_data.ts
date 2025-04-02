/**
 * Generate sphere data with the specified number of latitude and longitude bands
 */
function generateSphere(latBands = 30, longBands = 30, radius = 1) {
  const vertices: number[] = [];
  const normals: number[] = [];
  const texCoords: number[] = [];
  const indices: number[] = [];

  // Generate vertices, normals, and texture coordinates
  for (let lat = 0; lat <= latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= longBands; lon++) {
      const phi = (lon * 2 * Math.PI) / longBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      // Calculate vertex position
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      // Position
      vertices.push(radius * x, radius * y, radius * z);

      // Normal (normalized)
      normals.push(x, y, z);

      // Texture coordinate
      const u = 1 - (lon / longBands);
      const v = 1 - (lat / latBands);
      texCoords.push(u, v);
    }
  }

  // Generate indices
  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < longBands; lon++) {
      const first = lat * (longBands + 1) + lon;
      const second = first + longBands + 1;

      // Triangle 1
      indices.push(first, second, first + 1);

      // Triangle 2
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}

const sphereData = generateSphere();

export const sphere_vertices = sphereData.vertices;
export const sphere_normals = sphereData.normals;
export const sphere_texCoords = sphereData.texCoords;
export const sphere_indices = sphereData.indices;

export default sphereData;
