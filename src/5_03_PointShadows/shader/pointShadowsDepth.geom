#version 330 core
layout (triangles) in;
layout (triangle_strip, max_vertices = 18) out;

uniform mat4 shadowMatrices[6];

out vec4 FragPos; // FragPos 来自几何着色器，输出每个顶点

void main()
{
	for (int face = 0; face < 6; ++face)
	{
		gl_Layer = face; // 内置变量，用于指定我们正在渲染哪个面
		for (int i = 0; i < 3; ++i) // 遍历三角形的每个顶点
		{
			FragPos = gl_in[i].gl_Position;
			gl_Position = shadowMatrices[face] * FragPos;
			EmitVertex();
		}
		EndPrimitive();
	}
}