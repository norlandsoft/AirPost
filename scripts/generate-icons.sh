#!/bin/bash

# 生成 Electron 应用图标脚本
# 需要安装 ImageMagick: brew install imagemagick

SVG_FILE="assets/icon.svg"
OUTPUT_DIR="assets"

echo "开始生成图标文件..."

# 检查 SVG 文件是否存在
if [ ! -f "$SVG_FILE" ]; then
    echo "错误: $SVG_FILE 不存在"
    exit 1
fi

# 检查是否安装了 ImageMagick
if ! command -v convert &> /dev/null; then
    echo "错误: 未安装 ImageMagick"
    echo "请运行: brew install imagemagick"
    exit 1
fi

# 创建临时目录
TEMP_DIR=$(mktemp -d)
echo "使用临时目录: $TEMP_DIR"

# 生成不同尺寸的 PNG
echo "生成 PNG 文件..."
for size in 16 32 128 256 512 1024; do
    convert -background none -resize ${size}x${size} "$SVG_FILE" "$TEMP_DIR/icon_${size}x${size}.png"
    echo "  ✓ ${size}x${size}"
done

# 生成 Linux 图标 (512x512 PNG)
echo "生成 Linux 图标..."
cp "$TEMP_DIR/icon_512x512.png" "$OUTPUT_DIR/icon.png"
echo "  ✓ icon.png"

# 生成 Windows 图标 (ICO 格式)
echo "生成 Windows 图标..."
convert "$TEMP_DIR/icon_16x16.png" "$TEMP_DIR/icon_32x32.png" "$TEMP_DIR/icon_256x256.png" "$OUTPUT_DIR/icon.ico"
echo "  ✓ icon.ico"

# 生成 macOS 图标 (ICNS 格式)
echo "生成 macOS 图标..."
ICONSET_DIR="$TEMP_DIR/icon.iconset"
mkdir -p "$ICONSET_DIR"

# macOS 需要特定的文件名
cp "$TEMP_DIR/icon_16x16.png" "$ICONSET_DIR/icon_16x16.png"
cp "$TEMP_DIR/icon_32x32.png" "$ICONSET_DIR/icon_32x32.png"
cp "$TEMP_DIR/icon_128x128.png" "$ICONSET_DIR/icon_128x128.png"
cp "$TEMP_DIR/icon_256x256.png" "$ICONSET_DIR/icon_256x256.png"
cp "$TEMP_DIR/icon_512x512.png" "$ICONSET_DIR/icon_512x512.png"
cp "$TEMP_DIR/icon_1024x1024.png" "$ICONSET_DIR/icon_1024x1024.png"

# 生成 @2x 版本
convert -background none -resize 32x32 "$SVG_FILE" "$ICONSET_DIR/icon_16x16@2x.png"
convert -background none -resize 64x64 "$SVG_FILE" "$ICONSET_DIR/icon_32x32@2x.png"
convert -background none -resize 256x256 "$SVG_FILE" "$ICONSET_DIR/icon_128x128@2x.png"
convert -background none -resize 512x512 "$SVG_FILE" "$ICONSET_DIR/icon_256x256@2x.png"
convert -background none -resize 1024x1024 "$SVG_FILE" "$ICONSET_DIR/icon_512x512@2x.png"

# 使用 iconutil 生成 .icns
iconutil -c icns "$ICONSET_DIR" -o "$OUTPUT_DIR/icon.icns"
echo "  ✓ icon.icns"

# 清理临时文件
rm -rf "$TEMP_DIR"
echo ""
echo "✅ 所有图标文件已生成到 $OUTPUT_DIR/ 目录"
echo "   - icon.png (Linux)"
echo "   - icon.ico (Windows)"
echo "   - icon.icns (macOS)"
