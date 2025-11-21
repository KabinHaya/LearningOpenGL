#version 330 core
layout (location = 0) in vec3 aPos;     // 顶点坐标
layout (location = 1) in vec3 aNormal;       // 法向量
layout (location = 2) in vec2 aTexCoords;    // 纹理坐标

layout (location = 3) in vec3 aTangent;
layout (location = 4) in vec3 aBitangent;

struct Light
{
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

out VS_OUT
{
    vec3 FragPos;        // 传出片段位置
    vec2 TexCoords;      // 传出材质坐标
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} vs_out;

uniform mat4 model;         // 模型矩阵
uniform mat4 view;          // 视图矩阵
uniform mat4 projection;    // 投影矩阵
uniform float uvScale;

uniform vec3 viewPos;           // 摄像机位置
uniform Light light;            // 灯光

void main()
{
    vs_out.FragPos = vec3(model * vec4(aPos, 1.0f));    
    vs_out.TexCoords = aTexCoords * uvScale;
    
    mat3 normalMatrix = transpose(inverse(mat3(model)));
    vec3 T = normalize(normalMatrix * aTangent);
    // vec3 B = normalize(normalMatrix * aBitangent);
    vec3 N = normalize(normalMatrix * aNormal);
    T = normalize(T - dot(T, N) * N);
    vec3 B = cross(N, T);

    mat3 TBN = transpose(mat3(T, B, N));
    vs_out.TangentLightPos = TBN * light.position;
    vs_out.TangentViewPos  = TBN * viewPos;
    vs_out.TangentFragPos  = TBN * vs_out.FragPos;

    gl_Position = projection * view * model * vec4(aPos, 1.0f);
}