# Expo CNG Unity Monorepo

モバイル (Expo CNG) / Web (Vite) / Unity を単一リポジトリで連携させるためのスターターです。Expo Prebuild (CNG) を前提とし、ネイティブ差分は Config Plugin に集約します。

## 構成

```
/
├── app/                 # Expo CNG アプリ (iOS / Android / Expo Web)
│   ├── app.config.ts    # 単一の真実源 + Unity Config Plugin 登録
│   └── src/             # React Native / shared UI ロジック
├── web/                 # Web (Vite + React + react-unity-webgl)
│   └── public/unity/    # Unity WebGL Export の配置先
├── packages/
│   └── common/          # 共有 TypeScript ロジック (workspace 連携)
├── unity/               # Unity プロジェクト本体 (Library/WebGL Export)
├── .github/workflows/   # Lint / Typecheck / Web build / Prebuild CI
├── package.json         # pnpm ワークスペース設定
└── pnpm-workspace.yaml  # pnpm ワークスペース定義
```

## 前提

- Node.js 20.19.0 (`.nvmrc`, `.node-version` で固定)
- Corepack + pnpm 9
- タイムゾーン: Asia/Tokyo
- Expo Dev Client 運用
- `app/ios`, `app/android` は Git 管理しない (expo prebuild で再生成)

## セットアップ

```bash
corepack enable
pnpm install
```

必要な環境変数は `app/.env.example` を参照して `.env` を作成し、`app.config.ts` の `extra` から取得します。

## Docker 開発環境

Android SDK を含んだ開発環境を Docker で再現する場合は、以下のコンテナ構成を利用できます。

```bash
# 初回のみイメージをビルド
docker compose build

# Expo / Android の開発で利用するモバイル向けシェルを起動
docker compose run --rm mobile bash

# Web フロントエンドの開発サーバを起動
docker compose up web
```

`mobile` サービスは `adb` と接続できるように `host.docker.internal` を解決し、`web` サービスは Vite の dev サーバをポート `5173` でホストします。Gradle と pnpm ストアはボリュームに永続化されます。

## モバイル開発フロー (Expo CNG)

1. Expo 依存を追加・設定 → `app/app.config.ts` に反映
2. ネイティブ差分は Config Plugin (`expo-embed-android-unity-project`) に実装
3. 初回は `pnpm --filter expo-cng-unity-app run prebuild -- --clean`
4. 以降、変更時に `pnpm --filter expo-cng-unity-app run prebuild`
5. `pnpm --filter expo-cng-unity-app run ios` / `run android` (dev client)
6. `pnpm --filter expo-cng-unity-app run start` で Metro を起動

## Unity as a Library 連携 (Config Plugin)

`expo-embed-android-unity-project` (本リポジトリ内 workspace) が Expo Prebuild 時に以下を適用します。

- **Android**: `settings.gradle` に `unityLibrary` を include、`app/build.gradle` に `implementation project(':unityLibrary')`

Unity 側で出力したライブラリのパスは `app/app.config.ts` のプラグイン設定で調整してください。iOS 連携は未対応のため、必要になった段階で別途プラグインを追加してください。

## Web (Unity WebGL)

- `web/` は Vite + React + TypeScript
- `react-unity-webgl` を利用し、Start ボタン押下時に WebGL ビルドを遅延ロード
- Unity WebGL Export は `web/public/unity/` に配置 (例: `Build.loader.js`, `Build.data`, `Build.framework.js`, `Build.wasm`)
- 開発サーバ: `pnpm --filter expo-cng-unity-web run dev`

## 共有ロジック

- `packages/common` に共有 TypeScript 関数を配置
- Expo / Web 双方から `@expocngunity/common` として参照

## CI

`.github/workflows/ci.yml` で以下を検証します。

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build:web`
- `pnpm prebuild` (Expo prebuild の健全性チェック)

## Unity 出力の配置

| ターゲット | 出力手順 | 配置先 |
| ---------- | -------- | ------ |
| iOS        | Unity as a Library で `UnityExport` 生成 | 今後の対応予定 |
| Android    | Unity as a Library (Gradle) | `app/app.config.ts` の `expo-embed-android-unity-project` 設定に合わせて配置 |
| WebGL      | Build Settings → WebGL Export | `web/public/unity/` |

## よくあるポイント

- `app/ios`, `app/android` は commit しないでください (CNG 運用)
- Config Plugin に追加した処理は `expo prebuild` 実行時に毎回適用されます
- ネイティブコードの変更を行ったら `expo prebuild --clean` から再生成し直すと差分が取り込みやすいです
- WebGL ビルドが存在しない場合でもアプリは起動します (プレースホルダー表示)

## ライセンス

MIT
