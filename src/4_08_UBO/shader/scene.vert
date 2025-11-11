#version 330 core
layout (location = 0) in vec3 aPos;     // 顶点坐标
layout (location = 1) in vec3 aNormal;       // 法向量
layout (location = 2) in vec2 aTexCoords;    // 纹理坐标


// NOTE: 注意顺序不能乱，否则后面填入数据时也需要相应修改
layout (std140) uniform Matrices
{
    mat4 projection;    // 投影矩阵
    mat4 view;          // 视图矩阵
};

// 接口块
out VS_OUT
{
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
} vs_out;

uniform mat4 model;      // 模型矩阵

void main()
{
    vs_out.FragPos = vec3(model * vec4(aPos, 1.0f));    
    // 解决不等比缩放，使用法线矩阵（model 的逆转置）
    // 不推荐在着色器上进行矩阵求逆，对GPU开销过大
    vs_out.Normal = mat3(transpose(inverse(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    // 注意乘法要从右向左读
    gl_Position = projection * view * vec4(vs_out.FragPos, 1.0f);
}