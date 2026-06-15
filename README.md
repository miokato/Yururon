# Yururon
YururonはiOS/iPadOS向けの論文配信アプリです。
アプリの詳細は[こちら](https://yururon.app/)。
このリポジトリには利用規約などドキュメントを配置しています。

![Yururon icon](https://yururon.app/assets/icon.jpeg "Yururon icon")

## 構成
- `docs/` :  ウェブサイトのソース。
- `scripts/build.mjs` : ビルドスクリプト。`docs/` を読み込み、`.md` を `.html` 化し、静的ファイルを `dist/` へコピーする。

## ビルド

```bash
npm install # 初回のみ
npm run build # docs/ → dist/ を生成
npx serve dist # ローカルで動作テスト
```