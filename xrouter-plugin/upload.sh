#!/bin/bash

# 获取当前目录
current_dir=$(pwd)

# 读取 package.json 中的 version 字段
version=$(jq -r '.version' "$current_dir/package.json")

echo $version
# 检查是否成功读取版本号
if [ -z "$version" ]; then
  echo "Error: Unable to read version from package.json"
  exit 1
fi

# 定义 xrouter-constants.ts 文件路径
constants_file="$current_dir/src/plugin/xrouter-constants.ts"

# 检查文件是否存在
if [ ! -f "$constants_file" ]; then
  echo "Error: File $constants_file does not exist"
  exit 1
fi

# 替换文件中的 version 值
# 使用 sed 命令，确保只替换 version 的值


sed -i '' "s/^export const version = .*$/export const version = \"$version\";/" "$constants_file"

# 检查是否成功替换
if [ $? -eq 0 ]; then
  echo "Version updated successfully in $constants_file"
else
  echo "Error: Failed to update version in $constants_file"
  exit 1
fi