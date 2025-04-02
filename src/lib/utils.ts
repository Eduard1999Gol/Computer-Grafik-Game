import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
/**
 * Compiles a shader program from vertex and fragment shader sources
 * @param gl WebGL2 context
 * @param vsSource Vertex shader source code
 * @param fsSource Fragment shader source code
 * @returns Compiled WebGL program or null if compilation failed
 */
export function compileShaderProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string
): WebGLProgram | null {
  // Create and compile vertex shader
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  if (!vertexShader) {
    console.error('Failed to compile vertex shader');
    return null;
  }

  // Create and compile fragment shader
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!fragmentShader) {
    console.error('Failed to compile fragment shader');
    gl.deleteShader(vertexShader);
    return null;
  }

  // Create shader program and attach shaders
  const shaderProgram = gl.createProgram();
  if (!shaderProgram) {
    console.error('Failed to create shader program');
    return null;
  }

  // Attach shaders to the program
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  
  // Link shader program
  gl.linkProgram(shaderProgram);

  // Check for linking errors
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Failed to link shader program:', gl.getProgramInfoLog(shaderProgram));
    gl.deleteProgram(shaderProgram);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  // Clean up individual shaders as they're now linked into the program
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return shaderProgram;
}

/**
 * Compiles an individual shader
 * @param gl WebGL2 context
 * @param type Shader type (VERTEX_SHADER or FRAGMENT_SHADER)
 * @param source Shader source code
 * @returns Compiled shader or null if compilation failed
 */
function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  // Create shader
  const shader = gl.createShader(type);
  if (!shader) {
    console.error('Failed to create shader');
    return null;
  }

  // Set shader source and compile
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Check for compilation errors
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      'Shader compilation error:',
      gl.getShaderInfoLog(shader),
      '\nShader source:',
      source
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function loadTexture(gl: WebGL2RenderingContext, url: string): Promise<WebGLTexture> {
  return new Promise((resolve, reject) => {
    const texture = gl.createTexture();
    if (!texture) {
      reject(new Error('Failed to create texture'));
      return;
    }
    
    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      // Generate mipmaps if the image dimensions are powers of 2
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // Otherwise set texture parameters for non-power-of-2 textures
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      
      resolve(texture);
    };
    
    image.onerror = () => {
      reject(new Error(`Failed to load texture: ${url}`));
    };
    
    image.src = url;
  });
}

function isPowerOf2(value: number): boolean {
  return (value & (value - 1)) === 0;
}
