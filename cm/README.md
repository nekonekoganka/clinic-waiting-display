# CM動画フォルダ

## 使い方

1. `videos/` フォルダにMP4動画を入れる
2. `settings.json` の `cm.animations` に追加する

## 例

```json
{
  "id": "video-cm",
  "name": "サンプル動画CM",
  "type": "video",
  "src": "cm/videos/sample.mp4",
  "duration": 30,
  "enabled": true
}
```

## 注意事項

- 対応形式: MP4 (H.264推奨)
- 動画は自動再生・ミュート・ループなしで再生されます
- duration は動画の長さに合わせてください（動画終了で次の画面へ移行）
