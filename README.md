# 🍓 農園手帖

いちご農家向けの顧客管理・栽培記録アプリです。お客様情報、訪問記録、育苗〜収穫までの栽培記録（作業日誌・肥培・病害虫・農薬使用履歴・収穫・糖度・販売・トレーサビリティ・コスト・写真）を一元管理できます。

## 技術構成

- [Next.js 16](https://nextjs.org/) (App Router / Server Actions)
- [Prisma 7](https://www.prisma.io/) + PostgreSQL ([Vercel Postgres / Neon](https://vercel.com/storage/postgres) を想定)
- [Auth.js (NextAuth v5)](https://authjs.dev/) — メール・パスワードによるスタッフ共有ログイン
- [Vercel Blob](https://vercel.com/storage/blob) — 生育写真のアップロード
- Tailwind CSS 4 — いちごをイメージしたオリジナルデザイン

## ローカル開発環境のセットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. PostgreSQLの準備

ローカルにPostgreSQLが必要です(Homebrewの例):

```bash
brew install postgresql@16
brew services start postgresql@16
createdb nouenchou_dev
```

### 3. 環境変数の設定

`.env.example` を `.env` にコピーして値を設定してください。

```bash
cp .env.example .env
```

- `DATABASE_URL`: ローカルPostgreSQLの接続文字列
- `AUTH_SECRET`: `openssl rand -base64 32` などで生成した値
- `BLOB_READ_WRITE_TOKEN`: 写真アップロードを試す場合のみ必要（後述）

### 4. データベースのマイグレーション & シード投入

```bash
npx prisma migrate dev
npm run db:seed
```

シード実行後、以下の管理者アカウントでログインできます。

- メールアドレス: `admin@example.com`
- パスワード: `password123`

(`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` 環境変数で変更可能です)

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスしてください。

## Vercelへのデプロイ

### 1. リポジトリをVercelにインポート

GitHub等にプッシュしたリポジトリをVercelでインポートします。

### 2. Vercel Postgres (Neon) を作成

Vercelダッシュボードの **Storage → Create Database → Postgres** から作成し、プロジェクトに接続してください。接続すると `DATABASE_URL` などの環境変数が自動的に設定されます（変数名が異なる場合は `DATABASE_URL` にリネームしてください）。

### 3. Vercel Blob を作成(写真機能を使う場合)

**Storage → Create Database → Blob** から作成し、プロジェクトに接続してください。`BLOB_READ_WRITE_TOKEN` が自動設定されます。

### 4. 環境変数の設定

Vercelプロジェクトの **Settings → Environment Variables** に以下を追加します。

| 変数名 | 説明 |
| --- | --- |
| `DATABASE_URL` | Vercel Postgres接続文字列(Storage連携で自動設定) |
| `AUTH_SECRET` | `openssl rand -base64 32` で生成した値 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob接続時に自動設定 |

### 5. デプロイ

Vercelは `package.json` の `vercel-build` スクリプトを自動的に使用し、ビルド時に `prisma generate` → `prisma migrate deploy` → `next build` を実行してデータベースのマイグレーションを適用します。

デプロイ後、管理者アカウントを作成するには以下のいずれかを行ってください。

- ローカルから本番の `DATABASE_URL` を指定して `npm run db:seed` を実行する
- Vercelの `vercel env pull` でローカルに本番環境変数を取得してから実行する

## 主な機能

- **ダッシュボード**: 登録お客様数、栽培中の作付、今月の収穫量・売上などをひと目で確認
- **お客様管理**: 基本情報、圃場・ハウス区画、訪問記録
- **栽培記録(作付)**: 育苗〜収穫までを1サイクルとして管理し、以下を記録
  - 作業日誌(灌水・整枝・摘果・誘引など)
  - 肥培管理(肥料・施用量・方法)
  - 病害虫記録(発生状況・対応・写真)
  - 農薬使用履歴(希釈倍率・収穫前日数)
  - 収穫記録(収穫量・等級・糖度・写真)
  - 販売記録(販売先・単価・出荷ロット番号によるトレーサビリティ)
  - コスト・収支管理(資材費・人件費など)
  - 生育写真
- **マスタ設定**: 品種・販売先・作業種別・肥料・農薬などプルダウンの選択肢を管理(各入力は「その他」から自由入力も可能)

## ディレクトリ構成

```
prisma/schema.prisma        データベーススキーマ
prisma/seed.ts               初期データ投入スクリプト
src/app/(app)/               ログイン後の画面(ダッシュボード・お客様・栽培記録・マスタ設定)
src/app/login/                ログイン画面
src/components/ui/            共通UIコンポーネント
src/lib/                      Prisma・認証・ユーティリティ
```
