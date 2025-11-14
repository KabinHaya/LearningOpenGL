#version 330 core
in vec4 FragPos;

uniform vec3 lightPos;
uniform float farPlane;


// 上个教程我们使用的是一个空的像素着色器
// 让OpenGL配置深度贴图的深度值
// 这次我们将计算自己的深度，这个深度就是每个片段位置和光源位置之间的线性距离
// 计算自己的深度值，使得之后的阴影计算更加直观

void main()
{
	// 获取片段和光源的距离
	float lightDistance = length(FragPos.xyz - lightPos);

	// 除以farPlane来映射到[0, 1]的范围
	lightDistance = lightDistance / farPlane;

	// 写入这个修改过后的深度
	gl_FragDepth = lightDistance;
	// gl_FragDepth = gl_FragCoord.z; // 原先的深度写入方式
}