# clinic-waiting-display

ふじみ野ひかり眼科の待合室向けデジタルサイネージ用Webアプリケーションです。

## デモ（GitHub Pages）

**[>>> オンラインデモを見る <<<](https://nekonekoganka.github.io/clinic-waiting-display/%E5%BE%85%E5%90%88%E5%AE%A4%E6%82%A3%E8%80%85%E6%83%85%E5%A0%B1%E6%8F%90%E4%BE%9B%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4.html)**

※ 画像ファイルがリポジトリにない場合、スライドショーは表示されません

## 機能

### 花粉飛散情報
- 月別の花粉カレンダー表示（1月〜12月）
- 対象花粉: ハンノキ属、スギ、ヒノキ、イネ科、ブタクサ属、ヨモギ属、カナムグラ
- 飛散レベル: 多い・やや多い・少ない（色分け表示）
- 今月の花粉情報と対策ポイントを自動表示

### 画面ローテーション
以下の画面が自動で切り替わります：

| 画面 | 表示時間 | 内容 |
|------|---------|------|
| メイン画面 | 30秒 | 花粉カレンダーと対策情報 |
| 花粉注意画面 | 15秒 | 今月注意すべき花粉の警告表示 |
| 対策ポイント | 15秒 | 花粉症対策のアドバイス |
| 画像スライドショー | 可変 | imagesフォルダの画像を順番に表示 |
| CMアニメーション | 可変 | スライドショーの合間に挿入 |
| 時計画面 | 15秒 | 現在時刻とクリニックロゴ |
| 天気予報 | 30秒 | ふじみ野市の天気（気象庁データ） |

### CMシステム
スライドショーの合間に、ロゴアニメーションやMP4動画を自動挿入できます。

---

## 使用方法

### 基本的な使い方

1. `待合室患者情報提供ディスプレイ.html` をブラウザで開く
2. 自動的に画面のローテーションが始まります

### ファイル構成

```
clinic-waiting-display/
├── 待合室患者情報提供ディスプレイ.html  # メインHTMLファイル
├── css/
│   └── style.css                         # スタイルシート
├── js/
│   └── main.js                           # JavaScriptメインロジック
├── settings.json                         # 全体設定ファイル
├── images/                               # スライドショー画像
│   ├── config.json                       # 画像リスト（自動生成）
│   └── *.png, *.jpg                      # 画像ファイル
├── cm/                                   # CM用フォルダ
│   ├── README.md                         # CM設定の説明
│   └── videos/                           # MP4動画CM用
├── ふじみ野ひかり眼科_ロゴ_高画質.png     # 時計画面用ロゴ
├── 画像リスト更新_Windows用.bat          # Windows用スクリプト
└── 画像リスト更新_Chromebook用.sh        # Chromebook用スクリプト
```

---

## 画像スライドショーの使い方

### 1. 画像を準備

ファイル名を以下の形式にしてください：

```
{順番}_{表示秒数}_{説明}.{拡張子}
```

**例:**
- `1_15_花粉症対策.png` → 1番目に表示、15秒間
- `2_20_アイフレイル情報.jpg` → 2番目に表示、20秒間
- `3_30_お知らせ.png` → 3番目に表示、30秒間

### 2. imagesフォルダに画像を入れる

```
images/
├── 1_15_花粉症対策.png
├── 2_20_アイフレイル1.png
├── 3_30_アイフレイル2.png
└── ...
```

### 3. 設定ファイルを更新

- **Windows**: `画像リスト更新_Windows用.bat` をダブルクリック
- **Chromebook**: ターミナルで `./画像リスト更新_Chromebook用.sh` を実行

### 4. HTMLを開く

新しい画像がスライドショーに追加されます。

### 対応画像形式

PNG, JPG, JPEG, GIF, WEBP

---

## CM設定の使い方

### settings.json について

`settings.json` でCMの動作を設定できます：

```json
{
  "cm": {
    "enabled": true,
    "interval": 2,
    "animations": [
      {
        "id": "billiard-screen",
        "name": "ビリヤードロゴ",
        "type": "animation",
        "duration": 30,
        "enabled": true
      },
      {
        "id": "logo-animation-screen",
        "name": "パーティクルロゴ",
        "type": "animation",
        "duration": 15,
        "enabled": true
      },
      {
        "id": "famicom-logo-screen",
        "name": "ファミコン風ロゴ",
        "type": "animation",
        "duration": 15,
        "enabled": true
      }
    ]
  }
}
```

### 設定項目

| 項目 | 説明 |
|------|------|
| `enabled` | CMシステムのON/OFF |
| `interval` | 画像N枚ごとにCMを1つ挿入（例: 2 = 2枚ごと） |
| `animations` | CMリスト（順番に使用される） |

### CMアニメーションの種類

| type | 説明 |
|------|------|
| `animation` | HTML内蔵アニメーション（id でスクリーンIDを指定） |
| `video` | MP4動画（src でファイルパスを指定） |

### 画面の流れ（例: interval=2）

```
メイン → 花粉 → Tips → 画像1 → 画像2 → [CM1] → 画像3 → 画像4 → [CM2] → 画像5 → 時計 → 天気
```

---

## MP4動画CMの追加方法

### 1. 動画ファイルを配置

```
cm/videos/
└── clinic-intro.mp4
```

### 2. settings.json に追加

```json
{
  "id": "video-cm-1",
  "name": "クリニック紹介動画",
  "type": "video",
  "src": "cm/videos/clinic-intro.mp4",
  "duration": 30,
  "enabled": true
}
```

### 注意事項

- 対応形式: MP4 (H.264推奨)
- 動画は自動再生・ミュートで再生されます
- `duration` は動画の長さに合わせてください

---

## カスタマイズ

### 画面表示時間の変更

`js/main.js` の `CONFIG.durations` で設定できます：

```javascript
const CONFIG = {
    durations: {
        main: 30000,      // メイン画面（ミリ秒）
        alert: 15000,     // 花粉注意画面
        tips: 15000,      // 対策ポイント
        clock: 15000,     // 時計画面
        weather: 30000,   // 天気予報画面
        // ...
    }
};
```

### CMの有効/無効切り替え

`settings.json` の各CMの `enabled` を `true` / `false` で切り替え：

```json
{
  "id": "billiard-screen",
  "enabled": false  // このCMを無効化
}
```

---

## 必要なファイル

| ファイル | 用途 |
|----------|------|
| `ふじみ野ひかり眼科_ロゴ_高画質.png` | 時計画面で表示 |
| `images/config.json` | スライドショー画像リスト（自動生成） |
| `settings.json` | CM設定 |

---

## データソース

- 花粉飛散情報: 環境省 花粉症環境保健マニュアル
- 天気予報: 気象庁

---

## 技術仕様

- HTML/CSS/JavaScript（フレームワーク不要）
- ファイル分離構成（HTML + 外部CSS + 外部JS）
- レスポンシブ対応（`clamp()` によるフォントサイズ調整）
- Noto Sans JP フォント使用
- 各種アニメーション効果（パーティクル、ビリヤード、ファミコン風等）
- 時間帯に応じた天気画面の背景変更（朝/昼/夕/夜）
