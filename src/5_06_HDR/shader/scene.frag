#version 330 core
out vec4 FragColor;             // 片段颜色

// 定义材质结构体
struct Material
{
    sampler2D diffuse;  // 漫反射贴图
    sampler2D specular; // 镜面光贴图
    float shininess;    // 高光指数
};

struct Light
{
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

in VS_OUT
{
    in vec3 FragPos;        // 片段位置
    in vec3 Normal;         // 法向量
    in vec2 TexCoords;      // 材质坐标
} fs_in;

uniform vec3 viewPos;           // 摄像机位置
uniform bool isBlinn;           // 是否为布林冯光照
uniform Material material;
uniform Light light;

void main()
{
    vec3 diffuseTexture = vec3(texture(material.diffuse, fs_in.TexCoords));
    vec3 specularTexture = vec3(texture(material.specular, fs_in.TexCoords));

    // 环境光
    vec3 ambient = light.ambient * diffuseTexture;

    // 漫反射
    vec3 norm = normalize(fs_in.Normal);
    vec3 lightDir = normalize(light.position - fs_in.FragPos); // 光的方向，从片段到光源
    float diff = max(dot(lightDir, norm), 0.0f);
    vec3 diffuse =  light.diffuse * (diff * diffuseTexture);

    // 镜面反射
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    float spec = 0.0f;
    vec3 halfwayDir = normalize(lightDir + viewDir);
    spec = pow(max(dot(norm, halfwayDir), 0.0f), material.shininess);
    
    vec3 specular = light.specular * (spec * specularTexture);
    vec3 result = ambient + diffuse + specular;

    FragColor = vec4(result, 1.0f);
}