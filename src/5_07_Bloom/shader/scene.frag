#version 330 core
layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 BrightColor;

// 定义材质结构体
struct Material
{
    sampler2D diffuse;  // 漫反射贴图
    sampler2D specular; // 镜面光贴图
    float shininess;    // 高光指数
};

struct PointLight {
    vec3 position;

    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};


#define NR_POINT_LIGHTS 4

in VS_OUT
{
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
} fs_in;

uniform vec3 viewPos;           // 摄像机位置
uniform Material material;
uniform PointLight pointLights[NR_POINT_LIGHTS];

uniform float bloomThreshold;

// 函数
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);

void main()
{
    // 属性
    vec3 normal = normalize(fs_in.Normal);
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    
    vec3 result = vec3(0.0f);
    for (int i = 0; i < NR_POINT_LIGHTS; i++)
    {
        result += CalcPointLight(pointLights[i], normal, fs_in.FragPos, viewDir);
    }

    // 检查结果是否高于某个阈值，如果是，则输出为bloom阈值颜色
    float brightness = dot(result, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > bloomThreshold)
        BrightColor = vec4(result, 1.0);
    else
        BrightColor = vec4(0.0, 0.0, 0.0, 1.0);

    FragColor = vec4(result, 1.0f);
}

vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 diffuseTexture = vec3(texture(material.diffuse, fs_in.TexCoords));
    vec3 specularTexture = vec3(texture(material.specular, fs_in.TexCoords));
    vec3 lightDir = normalize(light.position - fragPos);

    // 环境光
    vec3 ambient = light.ambient * diffuseTexture;
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * diffuseTexture;
    
    // 镜面反射
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * specularTexture;
    
    // 衰减
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + 
                    light.quadratic * (distance * distance));    
    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;

    return (ambient + diffuse + specular);
}
