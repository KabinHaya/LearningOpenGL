import os
from pathlib import Path

# 指定对应文件的后缀
file_suffix = '*.cpp'

# 定义旧文本和新文本
old_text = '''void scrollCallback(GLFWwindow* window, double offsetX, double offsetY)
{
    camera.ProcessMouseScroll(static_cast<float>(offsetY));
}'''

new_text = ''''''

# 获取脚本所在目录，并定位 src
HERE = Path(__file__).resolve().parent
SRC_DIR = HERE / 'src'

if not SRC_DIR.exists():
    raise FileNotFoundError(f"src 目录不存在: {SRC_DIR}")

# 递归查找所有  文件
for target_files in SRC_DIR.rglob(file_suffix):  # rglob 递归查找
    print(f"检查文件: {target_files}")
    try:
        content = target_files.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        print(f"⚠️ 编码错误，跳过: {target_files}（尝试其他编码如 latin1 或 gb2312）")
        continue

    if old_text in content:
        new_content = content.replace(old_text, new_text)
        target_files.write_text(new_content, encoding='utf-8')
        print(f"✅ 已更新: {target_files}")
    else:
        print(f"❌ 未找到匹配内容: {target_files}")