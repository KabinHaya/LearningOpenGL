#version 330 core
out vec4 FragColor;

in VS_OUT
{
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
} vs_in;

uniform sampler2D uvMap;

void main()
{
    vec3 result = vec3(1.0f);
    result = texture(uvMap, vs_in.TexCoords).rgb;
    FragColor = vec4(result * vec3(1.0f, 1.0f, 0.0f), 1.0f);   
}