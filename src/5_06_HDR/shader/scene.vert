#version 330 core
layout (location = 0) in vec3 aPos;     // 顶点坐标
layout (location = 1) in vec3 aNormal;       // 法向量
layout (location = 2) in vec2 aTexCoords;    // 纹理坐标

out VS_OUT
{
    out vec3 FragPos;        // 传出片段位置
    out vec3 Normal;         // 传出法向量
    out vec2 TexCoords;      // 传出材质坐标
} vs_out;

uniform mat4 model;         // 模型矩阵
uniform mat4 view;          // 视图矩阵
uniform mat4 projection;    // 投影矩阵
uniform float uvScale;

void main()
{
    vs_out.FragPos = vec3(model * vec4(aPos, 1.0f));    
    vs_out.Normal = mat3(transpose(inverse(model))) * aNormal;
    vs_out.TexCoords = aTexCoords * uvScale;
    gl_Position = projection * view * vec4(vs_out.FragPos, 1.0f);
}