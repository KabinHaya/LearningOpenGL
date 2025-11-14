#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
} fs_in;

uniform sampler2D diffuseTexture;
uniform samplerCube depthMap; // 修改的地方

uniform vec3 lightPos;
uniform vec3 viewPos;

uniform float farPlane;
uniform bool useShadows;

float ShadowCalculation(vec3 fragPos);

void main()
{           
    vec3 color = texture(diffuseTexture, fs_in.TexCoords).rgb;
    vec3 normal = normalize(fs_in.Normal);
    vec3 lightColor = vec3(0.3f);

    // 环境光
    vec3 ambient = 0.3f * lightColor;
    // 漫反射
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * lightColor;
    // 镜面反射
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = 0.0;
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;    

    // 计算阴影
    float shadow = useShadows ? ShadowCalculation(fs_in.FragPos) : 0.0f;
    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;    
    
    FragColor = vec4(lighting, 1.0);

}

float ShadowCalculation(vec3 fragPos)
{
    vec3 lightToFrag = fragPos - lightPos;
    float closestDepth = texture(depthMap, lightToFrag).r;
    closestDepth *= farPlane;
    float currentDepth = length(lightToFrag); // 当前片段和光源之间的深度值

    float bias = 0.05f;
    // float shadow = currentDepth - bias > closestDepth ? 1.0f : 0.0f;
    // 调试
    // FragColor = vec4(vec3(closestDepth / farPlane), 1.0);
    float shadow = 0.0f;
    // float samples = 4.0f;
    // float offset = 0.1f;
    // for (float x = -offset; x < offset; x += offset / (samples * 0.5))
    // {
    //     for (float y = -offset; y < offset; y += offset / (samples * 0.5))
    //     {
    //         for (float z = -offset; z < offset; z += offset / (samples * 0.5))
    //         {
    //             float closestDepth = texture(depthMap, lightToFrag + vec3(x, y, z)).r;
    //             closestDepth *= farPlane;
    //             if (currentDepth - bias > closestDepth)
    //                 shadow += 1.0f;
    //         }
    //     }
    // }
    // shadow /= (samples * samples * samples);

    vec3 sampleOffsetDirections[20] = vec3[]
    (
        vec3( 1,  1,  1), vec3( 1, -1,  1), vec3(-1, -1,  1), vec3(-1,  1,  1), 
        vec3( 1,  1, -1), vec3( 1, -1, -1), vec3(-1, -1, -1), vec3(-1,  1, -1),
        vec3( 1,  1,  0), vec3( 1, -1,  0), vec3(-1, -1,  0), vec3(-1,  1,  0),
        vec3( 1,  0,  1), vec3(-1,  0,  1), vec3( 1,  0, -1), vec3(-1,  0, -1),
        vec3( 0,  1,  1), vec3( 0, -1,  1), vec3( 0, -1, -1), vec3( 0,  1, -1)
    );

    int samples = 20;
    float viewDistance = length(viewPos - fragPos);
    float diskRadius = (1.0f + (viewDistance / farPlane)) / 25.0f;
    for (int i = 0; i < samples; ++i)
    {
        float closestDepth = texture(depthMap, lightToFrag + sampleOffsetDirections[i] * diskRadius).r;
        closestDepth *= farPlane;
        if (currentDepth - bias > closestDepth)
            shadow += 1.0f;
    }
    shadow /= float(samples);

    return shadow;
}