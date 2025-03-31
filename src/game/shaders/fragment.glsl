// Basic fragment shader for our endless runner game

precision mediump float;

varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vPosition;

uniform vec3 lightPosition;
uniform vec3 diffuseColor;
uniform sampler2D uTexture;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPosition - vPosition);
    
    float diff = max(dot(normal, lightDir), 0.1);
    vec3 diffuse = diff * diffuseColor;
    
    gl_FragColor = vec4(diffuse, 1.0) * texture2D(uTexture, vTexCoord);
}
