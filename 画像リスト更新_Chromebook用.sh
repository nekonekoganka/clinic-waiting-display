#!/bin/bash
# =====================================================
# 画像スライドショー設定ファイル自動生成スクリプト
# Mac/Linux用
#
# 使い方:
#   1. imagesフォルダに画像を入れる
#      ファイル名形式1: {順番}_{表示秒数}_{説明}.{拡張子}
#      例: 1_15_花粉症対策.png → 1番目に表示、15秒間
#      ファイル名形式2: {順番}_{表示秒数}_{分割数}_{説明}.{拡張子}
#      例: 6_20_3_花粉症ポスター.png → 6番目から3分割、各20秒表示
#   2. このスクリプトを実行: ./update-images.sh
#   3. images/config.json が自動生成される
# =====================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGES_DIR="$SCRIPT_DIR/images"
CONFIG_FILE="$IMAGES_DIR/config.json"

# imagesフォルダが存在しない場合は作成
if [ ! -d "$IMAGES_DIR" ]; then
    mkdir -p "$IMAGES_DIR"
    echo "imagesフォルダを作成しました"
fi

# 画像ファイルを検索（png, jpg, jpeg, gif, webp）
echo "imagesフォルダをスキャン中..."

# config.jsonを生成
echo '{' > "$CONFIG_FILE"
echo '  "description": "画像スライドショー設定（自動生成）",' >> "$CONFIG_FILE"
echo '  "format": "ファイル名: {順番}_{表示秒数}_{説明}.{拡張子}",' >> "$CONFIG_FILE"
echo '  "generated": "'$(date '+%Y-%m-%d %H:%M:%S')'",' >> "$CONFIG_FILE"
echo '  "images": [' >> "$CONFIG_FILE"

# 画像ファイルを取得してソート
first=true
find "$IMAGES_DIR" -maxdepth 1 -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.webp" -o -iname "*.pdf" \) | sort | while read -r filepath; do
    filename=$(basename "$filepath")

    # config.jsonは除外
    if [ "$filename" = "config.json" ]; then
        continue
    fi

    if [ "$first" = true ]; then
        first=false
    else
        echo ',' >> "$CONFIG_FILE"
    fi

    # ファイル名をJSON配列に追加（改行なし）
    printf '    "%s"' "$filename" >> "$CONFIG_FILE"
done

echo '' >> "$CONFIG_FILE"
echo '  ]' >> "$CONFIG_FILE"
echo '}' >> "$CONFIG_FILE"

# 画像数をカウント
count=$(find "$IMAGES_DIR" -maxdepth 1 -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.webp" -o -iname "*.pdf" \) | wc -l)

echo ""
echo "================================"
echo " 完了！"
echo " 検出した画像: $count 件"
echo " 設定ファイル: $CONFIG_FILE"
echo "================================"
echo ""
echo "ファイル名の形式:"
echo "  通常: {順番}_{表示秒数}_{説明}.{拡張子}"
echo "  分割: {順番}_{表示秒数}_{分割数}_{説明}.{拡張子}"
echo "  対応形式: png, jpg, jpeg, gif, webp, pdf"
echo "  例1: 1_15_花粉症対策.png → 1番目、15秒表示"
echo "  例2: 6_20_3_A4ポスター.png → 6番目から3分割、各20秒"
echo ""
