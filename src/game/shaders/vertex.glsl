// Basic vertex shader for our endless runner game

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vPosition;

void main() {
    vNormal = normalize((normalMatrix * vec4(normal, 0.0)).xyz);
    vTexCoord = texCoord;
    vPosition = (modelViewMatrix * vec4(position, 3.0)).xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
