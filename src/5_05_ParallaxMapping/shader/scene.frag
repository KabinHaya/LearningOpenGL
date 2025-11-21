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
    sampler2D depth;    // 视差贴图
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

uniform float heightScale;

uniform Light light;
uniform Material material;

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir);

void main()
{
    vec3 viewDir = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);    
    vec2 texCoords = ParallaxMapping(fs_in.TexCoords, viewDir);
    if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
        discard;

    vec3 diffuseTexture = texture(material.diffuse, texCoords).rgb;

    // 从法线贴图中获得范围为[0, 1]的法线
    vec3 normal = texture(material.normal, texCoords).rgb;
    // 将法线变换到范围[-1, 1]
    normal = normalize(normal * 2.0f - 1.0f); // 这个法线在切线空间

    // 环境光
    vec3 ambient = light.ambient * diffuseTexture;

    // 漫反射
    vec3 lightDir = normalize(fs_in.TangentLightPos - fs_in.TangentFragPos); // 光的方向，从片段到光源
    float diff = max(dot(lightDir, normal), 0.0f);
    vec3 diffuse =  light.diffuse * (diff * diffuseTexture);

    // 镜面反射    
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0f), material.shininess);
    vec3 specular = light.specular * spec;

    vec3 result = ambient + diffuse + specular;

    FragColor = vec4(result, 1.0f);
}

// vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
// {
//     float height = texture(material.depth, texCoords).r;
//     vec2 p = viewDir.xy / viewDir.z * (height * heightScale);
//     return texCoords - p;
// }

// 陡峭视差映射 和 视差遮蔽映射
vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{
    // 深度层的数量
    const float minLayers = 8;
    const float maxLayers = 32;
    float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0.0, 1.0, 0.0), viewDir))); // 注意，这个和物体的旋转角度有关，比如我绕z轴旋转了-90°，那么应该为(0, 1, 0)
    // 计算每一层的高度
    float layerDepth = 1.0 / numLayers;
    // 当前层级的深度
    float curLayerDepth = 0.0f;
    // 每层纹理坐标相对于向量 P 的偏移量
    vec2 P = viewDir.xy * heightScale;
    vec2 deltaTexCoords = P / numLayers;

    // 遍历所有层，从上到下，直到找到小于这一层的深度值的深度贴图值
    vec2 curTexCoords = texCoords;
    float curDepthMapValue = texture(material.depth, curTexCoords).r;

    while (curLayerDepth < curDepthMapValue)
    {
        // 沿着向量 P 改变纹理坐标值
        // 获得当前纹理坐标值的深度
        // 转换到下一层的深度
        curTexCoords -= deltaTexCoords;
        curDepthMapValue = texture(material.depth, curTexCoords).r;
        curLayerDepth += layerDepth;
    }
    
    // return curTexCoords;
    
    // 获取碰撞前的纹理坐标（逆向执行之前的操作）
    vec2 prevTexCoords = curTexCoords + deltaTexCoords;

    // 获取碰撞后和碰撞前的深度值，用于线性插值
    float afterDepth = curDepthMapValue - curLayerDepth;
    float beforeDepth = texture(material.depth, prevTexCoords).r - curLayerDepth + layerDepth;

    // 对纹理坐标进行插值
    float weight = afterDepth / (afterDepth - beforeDepth);
    vec2 finalTexCoords = prevTexCoords * weight + curTexCoords * (1.0f - weight);

    return finalTexCoords;

}