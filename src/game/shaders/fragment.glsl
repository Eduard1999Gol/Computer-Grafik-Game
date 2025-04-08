// Basic fragment shader for our endless runner game

precision mediump float;

varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vPosition;

uniform vec3 lightPosition;
uniform vec3 diffuseColor;
uniform sampler2D uTexture;
uniform int u_useTexture;
uniform vec2 u_textureOffset;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPosition - vPosition);
    
    // Improved lighting calculation with ambient component
    float ambient = 0.6;
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = (ambient + diff) * diffuseColor;
    
    // Scrolling
    if (u_useTexture == 1) {
        vec2 scrolledTexCoord = vTexCoord + u_textureOffset;
        vec4 texColor = texture2D(uTexture, scrolledTexCoord);
        gl_FragColor = vec4(diffuse * texColor.rgb, texColor.a);
    } else {
        gl_FragColor = vec4(diffuse, 1.0);
    }
}
