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
├── package.json         # Yarn Berry ワークスペース設定
└── .yarn/               # Yarn 4 (Berry) リリース
```

## 前提

- Node.js 20.19.0 (`.nvmrc`, `.node-version` で固定)
- Corepack + Yarn Berry (Yarn 4)
- タイムゾーン: Asia/Tokyo
- Expo Dev Client 運用
- `app/ios`, `app/android` は Git 管理しない (expo prebuild で再生成)

## セットアップ

```bash
corepack enable
yarn install
```

必要な環境変数は `app/.env.example` を参照して `.env` を作成し、`app.config.ts` の `extra` から取得します。

## モバイル開発フロー (Expo CNG)

1. Expo 依存を追加・設定 → `app/app.config.ts` に反映
2. ネイティブ差分は Config Plugin (`app/plugins/withUnityIntegration.ts`) に実装
3. 初回は `yarn --cwd app expo prebuild --clean`
4. 以降、変更時に `yarn --cwd app expo prebuild`
5. `yarn --cwd app expo run:ios` / `run:android` (dev client)
6. `yarn --cwd app expo start` で Metro を起動

### UnityBridge API

`app/src/bridge/UnityBridge.ts` に JS 側 API (`show`, `postMessage`) を定義。Unity ランタイム未接続でもダミー画面で遷移動作を確認できます。

## Unity as a Library 連携 (Config Plugin)

`app/plugins/withUnityIntegration.ts` が Expo Prebuild 時に以下を適用します。

- **Android**: `settings.gradle` に `unityLibrary` を include、`app/build.gradle` に `implementation project(':unityLibrary')`
- **iOS**: `UnityFramework` の参照を Xcode プロジェクトへ追加、`AppDelegate` 初期化コードを挿入

Unity 側で出力したライブラリのパスは `app/app.config.ts` のプラグイン設定で調整してください。

## Web (Unity WebGL)

- `web/` は Vite + React + TypeScript
- `react-unity-webgl` を利用し、Start ボタン押下時に WebGL ビルドを遅延ロード
- Unity WebGL Export は `web/public/unity/` に配置 (例: `Build.loader.js`, `Build.data`, `Build.framework.js`, `Build.wasm`)
- 開発サーバ: `yarn --cwd web dev`

## 共有ロジック

- `packages/common` に共有 TypeScript 関数を配置
- Expo / Web 双方から `@expocngunity/common` として参照

## CI

`.github/workflows/ci.yml` で以下を検証します。

- `yarn install --immutable`
- `yarn lint`
- `yarn typecheck`
- `yarn build:web`
- `yarn prebuild` (Expo prebuild の健全性チェック)

## Unity 出力の配置

| ターゲット | 出力手順 | 配置先 |
| ---------- | -------- | ------ |
| iOS        | Unity as a Library で `UnityExport` 生成 | `app/plugins/withUnityIntegration.ts` の `ios.unityProjectPath` に合わせて配置 |
| Android    | Unity as a Library (Gradle) | `app/plugins/withUnityIntegration.ts` の `android.unityProjectPath` に合わせて配置 |
| WebGL      | Build Settings → WebGL Export | `web/public/unity/` |

## よくあるポイント

- `app/ios`, `app/android` は commit しないでください (CNG 運用)
- Config Plugin に追加した処理は `expo prebuild` 実行時に毎回適用されます
- ネイティブコードの変更を行ったら `expo prebuild --clean` から再生成し直すと差分が取り込みやすいです
- WebGL ビルドが存在しない場合でもアプリは起動します (プレースホルダー表示)

## ライセンス

MIT
