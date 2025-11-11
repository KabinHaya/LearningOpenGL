import os
from pathlib import Path

# 定义旧函数和新函数内容
old_text = '''void processInput(GLFWwindow* window)
{
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);

    // 问题在于斜着走会更快，不过这个暂时不用考虑
    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
        camera.ProcessKeyboard(Camera_Movement::FORWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
        camera.ProcessKeyboard(Camera_Movement::BACKWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
        camera.ProcessKeyboard(Camera_Movement::LEFT, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
        camera.ProcessKeyboard(Camera_Movement::RIGHT, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_SPACE) == GLFW_PRESS)
        camera.ProcessKeyboard(Camera_Movement::UP, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_LEFT_CONTROL) == GLFW_PRESS)
        camera.ProcessKeyboard(Camera_Movement::DOWN, deltaTime);
}
'''

new_text = '''void processInput(GLFWwindow* window)
{
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);

    std::unordered_set<Camera_Movement> operations;

    // 问题在于斜着走会更快，不过这个暂时不用考虑
    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
        operations.insert(Camera_Movement::FORWARD);
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
        operations.insert(Camera_Movement::BACKWARD);
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
        operations.insert(Camera_Movement::LEFT);
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
        operations.insert(Camera_Movement::RIGHT);
    if (glfwGetKey(window, GLFW_KEY_SPACE) == GLFW_PRESS)
        operations.insert(Camera_Movement::UP);
    if (glfwGetKey(window, GLFW_KEY_LEFT_CONTROL) == GLFW_PRESS)
        operations.insert(Camera_Movement::DOWN);

    if (!operations.empty())
        camera.ProcessKeyboard(operations, deltaTime);
}
'''

# 获取脚本所在目录，并定位 src
HERE = Path(__file__).resolve().parent
SRC_DIR = HERE / 'src'

if not SRC_DIR.exists():
    raise FileNotFoundError(f"src 目录不存在: {SRC_DIR}")

# 递归查找所有 .cpp 文件
for cpp_file in SRC_DIR.rglob('*.cpp'):  # rglob 递归查找
    print(f"检查文件: {cpp_file}")
    try:
        content = cpp_file.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        print(f"⚠️ 编码错误，跳过: {cpp_file}（尝试其他编码如 latin1 或 gb2312）")
        continue

    if old_text in content:
        new_content = content.replace(old_text, new_text)
        cpp_file.write_text(new_content, encoding='utf-8')
        print(f"✅ 已更新: {cpp_file}")
    else:
        print(f"❌ 未找到匹配内容: {cpp_file}")