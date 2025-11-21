#version 330 core
out vec4 FragColor;             // 片段颜色

struct Light
{
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct Material
{
    sampler2D diffuse;  // 漫反射贴图
    sampler2D normal;   // 法线贴图
    float shininess;    // 高光指数
};

in VS_OUT
{
    vec3 FragPos;        // 传出片段位置
    vec2 TexCoords;      // 传出材质坐标
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} fs_in;

uniform Light light;
uniform Material material;

void main()
{
    vec3 diffuseTexture = texture(material.diffuse, fs_in.TexCoords).rgb;

    // 从法线贴图中获得范围为[0, 1]的法线
    vec3 normal = texture(material.normal, fs_in.TexCoords).rgb;
    // 将法线变换到范围[-1, 1]
    normal = normalize(normal * 2.0f - 1.0f); // 这个法线在切线空间

    // 环境光
    vec3 ambient = light.ambient * diffuseTexture;

    // 漫反射
    vec3 lightDir = normalize(fs_in.TangentLightPos - fs_in.TangentFragPos); // 光的方向，从片段到光源
    float diff = max(dot(lightDir, normal), 0.0f);
    vec3 diffuse =  light.diffuse * (diff * diffuseTexture);

    // 镜面反射
    vec3 viewDir = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);    
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0f), material.shininess);
    vec3 specular = light.specular * spec;

    vec3 result = ambient + diffuse + specular;

    FragColor = vec4(result, 1.0f);
}