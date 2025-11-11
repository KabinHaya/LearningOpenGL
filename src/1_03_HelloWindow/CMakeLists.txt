# 将源代码添加到此项目的可执行文件。
set(TARGET_NAME 1_03_HelloWindow)

add_executable (${TARGET_NAME}
    main.cpp
)

if (CMAKE_VERSION VERSION_GREATER 3.12)
  set_property(TARGET ${TARGET_NAME} PROPERTY CXX_STANDARD 20)
endif()

target_include_directories(${TARGET_NAME} PRIVATE 
    ${MYLIB_INCLUDE_DIR}
)
target_link_libraries(${TARGET_NAME}
    ${GLFW_LIBRARY}
    glad
)