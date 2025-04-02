import { loadTexture as loadTextureUtil } from './utils';

/**
 * Manages textures for the game
 */
export class TextureManager {
  private textures: Map<string, WebGLTexture> = new Map();
  private gl: WebGL2RenderingContext;
  
  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }
  
  /**
   * Loads a texture from URL
   * @param name Identifier for the texture
   * @param url URL of the texture image
   * @returns Promise that resolves when texture is loaded
   */
  async loadTexture(name: string, url: string): Promise<void> {
    try {
      const texture = await loadTextureUtil(this.gl, url);
      this.textures.set(name, texture);
    } catch (error) {
      console.error(`Failed to load texture '${name}' from ${url}:`, error);
    }
  }
  
  /**
   * Get a loaded texture by name
   * @param name Texture identifier
   * @returns WebGLTexture or null if not found
   */
  getTexture(name: string): WebGLTexture | null {
    return this.textures.get(name) || null;
  }
  
  /**
   * Load multiple textures at once
   * @param textures Array of {name, url} objects
   * @returns Promise that resolves when all textures are loaded
   */
  async loadTextures(textures: {name: string, url: string}[]): Promise<void> {
    const promises = textures.map(texture => 
      this.loadTexture(texture.name, texture.url)
    );
    await Promise.all(promises);
  }
  
  /**
   * Delete a texture and remove it from the manager
   * @param name Texture identifier
   */
  deleteTexture(name: string): void {
    const texture = this.textures.get(name);
    if (texture) {
      this.gl.deleteTexture(texture);
      this.textures.delete(name);
    }
  }
  
  /**
   * Clean up all textures
   */
  dispose(): void {
    this.textures.forEach(texture => {
      this.gl.deleteTexture(texture);
    });
    this.textures.clear();
  }
}
