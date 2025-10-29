#version 330 core
out vec4 FragColor;
in vec2 outTexCoord;
in vec3 outNormal;

uniform vec3 lightColor;
uniform vec3 lightPos;
uniform float ambientStrength;

// 采样
uniform sampler2D texture1; // 默认传递为 0
uniform sampler2D texture2;

void main()
{
    vec3 ambient = ambientStrength * lightColor;

    vec3 result = ambient * vec3(1.0f, 0.5f, 0.31f);

    // FragColor = mix(texture(texture1, outTexCoord), texture(texture2, outTexCoord), 0.2);
    FragColor = vec4(result, 1.0f);
}