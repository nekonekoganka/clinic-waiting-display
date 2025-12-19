@echo off
chcp 65001 > nul
REM =====================================================
REM 画像スライドショー設定ファイル自動生成スクリプト
REM Windows用（ダブルクリックで実行可能）
REM
REM 使い方:
REM   1. imagesフォルダに画像を入れる
REM      ファイル名形式1: {順番}_{表示秒数}_{説明}.{拡張子}
REM      例: 1_15_花粉症対策.png → 1番目に表示、15秒間
REM      ファイル名形式2: {順番}_{表示秒数}_{分割数}_{説明}.{拡張子}
REM      例: 6_20_3_花粉症ポスター.png → 6番目から3分割、各20秒表示
REM   2. このファイルをダブルクリック
REM   3. images/config.json が自動生成される
REM =====================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "IMAGES_DIR=%SCRIPT_DIR%images"
set "CONFIG_FILE=%IMAGES_DIR%\config.json"

REM imagesフォルダが存在しない場合は作成
if not exist "%IMAGES_DIR%" (
    mkdir "%IMAGES_DIR%"
    echo imagesフォルダを作成しました
)

echo imagesフォルダをスキャン中...

REM 日時を取得
for /f "tokens=1-3 delims=/" %%a in ('date /t') do set "TODAY=%%a-%%b-%%c"
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "NOW=%%a:%%b"

REM config.jsonのヘッダーを書き込み
(
echo {
echo   "description": "画像スライドショー設定（自動生成）",
echo   "format": "ファイル名: {順番}_{表示秒数}_{説明}.{拡張子}",
echo   "generated": "%TODAY% %NOW%",
echo   "images": [
) > "%CONFIG_FILE%"

REM 画像ファイルを検索
set "count=0"
set "first=1"

for %%e in (png jpg jpeg gif webp pdf) do (
    for %%f in ("%IMAGES_DIR%\*.%%e") do (
        if exist "%%f" (
            set "filename=%%~nxf"

            REM config.jsonは除外
            if /i not "!filename!"=="config.json" (
                if !first!==0 (
                    echo ,>> "%CONFIG_FILE%"
                )
                set "first=0"
                set /a count+=1

                REM ファイル名を追加（改行なしで）
                <nul set /p="    \"!filename!\"" >> "%CONFIG_FILE%"
            )
        )
    )
)

REM config.jsonのフッターを書き込み
(
echo.
echo   ]
echo }
) >> "%CONFIG_FILE%"

echo.
echo ================================
echo  完了！
echo  検出した画像: %count% 件
echo  設定ファイル: %CONFIG_FILE%
echo ================================
echo.
echo ファイル名の形式:
echo   通常: {順番}_{表示秒数}_{説明}.{拡張子}
echo   分割: {順番}_{表示秒数}_{分割数}_{説明}.{拡張子}
echo   対応形式: png, jpg, jpeg, gif, webp, pdf
echo   例1: 1_15_花粉症対策.png → 1番目、15秒表示
echo   例2: 6_20_3_A4ポスター.png → 6番目から3分割、各20秒
echo.

pause
