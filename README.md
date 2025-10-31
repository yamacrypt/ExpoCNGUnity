# ExpoCNGUnity

ExpoCNGUnity は、Expo Router ベースの React Native アプリに Unity を組み込むための検証プロジェクトです。モバイル向けのネイティブランタイムと WebGL ビルドの両方を扱えるように、リポジトリは pnpm ワークスペースで構成されており、同梱の Docker 環境を使って Android SDK をセットアップすることもできます。

## プロジェクト構成

| ディレクトリ | 説明 |
| --- | --- |
| `app/` | Expo Router を利用した React Native アプリ本体。Unity ライブラリを Gradle に追加する独自の config plugin を含みます。 |
| `unity/` | Unity プロジェクト用ワークスペース。Android Library や WebGL ビルドをここからエクスポートします。 |
| `web/` | Vite + React 製の Web プロジェクト。`react-unity-webgl` で WebGL ビルドを埋め込みます。 |
| `docker/` | Android SDK／pnpm を含む開発用コンテナの Dockerfile。 |
| `docker-compose.yml` | モバイル開発および Web プレビュー用のコンテナ起動設定。 |

## 必要環境

- Node.js 20 以上と pnpm 10（`corepack enable` で導入可能）
- Expo CLI（`npx expo` 経由で利用可能）
- Android / iOS ネイティブビルドに必要な SDK 類
- Unity Editor（Android Library および WebGL ビルドのエクスポートに使用）

> **ヒント:** Android 向けには、同梱の Dockerfile が OpenJDK 17・Android SDK・pnpm をまとめてセットアップします。ローカル環境を汚したくない場合に活用できます。

## セットアップ

1. 依存関係をインストールします。
   ```bash
   pnpm install
   ```
2. Unity プロジェクトをビルドし、成果物を以下の場所に配置します。
   - Android: `unity/builds/android/unityLibrary/`（`Unity as a Library` エクスポートを格納）
   - WebGL: `web/public/unity/`（`Build` フォルダと `TemplateData` などを丸ごとコピー）

   Unity 側の詳しい手順は [`unity/README.md`](unity/README.md) を参照してください。

## Expo アプリの起動

```bash
pnpm --filter app run start
```

- Android 端末/エミュレータ: `pnpm --filter app run android`
- iOS シミュレータ: `pnpm --filter app run ios`

Android ネイティブビルドでは、`app/plugins/withUnityLibrary.js` が `app/.env` に記載した `SDKDIR` と `NDKDIR` を `android/local.properties` や `gradle.properties` に書き出して Unity ライブラリを組み込みます。環境ごとに適切なパスを設定してください。

## Web プレビュー

WebGL ビルドをブラウザで確認したい場合は、以下を実行します。

```bash
pnpm --filter web run dev
```

Vite の開発サーバーが `http://localhost:5173` で起動し、Unity の WebGL ビルド（`/unity/Build/...` を参照）を `react-unity-webgl` で読み込みます。

## Docker を使った開発

Android SDK 付きの開発環境をコンテナで起動したい場合は、Docker と Docker Compose を用意したうえで次のコマンドを実行します。

```bash
docker compose up -d mobile
```

`mobile` サービスはリポジトリ全体をマウントした状態で起動し、必要なポート（19000 番台の Expo Dev Server / Metro など）をホストに公開します。Web プロジェクトのホットリロードが必要であれば、`docker compose up web` で Vite サーバーを立ち上げられます。

## よく使うスクリプト

- `pnpm --filter app run lint` — Expo アプリの ESLint 実行
- `pnpm --filter web run build` — Web プロジェクトの本番ビルド

必要に応じて `package.json` や各ワークスペースの README を参照し、追加のスクリプトを確認してください。
