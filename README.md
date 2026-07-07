# 在庫管理システム (zaikoSystem)

社内在庫管理システム。在庫一覧の閲覧・検索・行編集(入出庫)・一括入庫登録・CSV ダウンロードを提供する。

2026-07 に Laravel 10 + Inertia から **Bun + Hono + React SPA** へフルリプレイスした(Issue #43)。
移植仕様・検証記録は [docs/migration-spec.md](docs/migration-spec.md) を参照。

## 技術スタック

| 層 | 技術 |
|---|---|
| ランタイム | [Bun](https://bun.sh) |
| API | Hono(RPC)+ Drizzle ORM + Better Auth |
| フロント | React 19 + Vite + TanStack Router / Query + Tailwind CSS 4 |
| DB | PostgreSQL |
| Lint / Format | Biome |
| テスト | api: `bun test` / web: Vitest + Testing Library |

## リポジトリ構成

```
apps/api/          # Hono API(認証・在庫 API・Drizzle スキーマ)
apps/web/          # React SPA
packages/shared/   # API/フロント共有の zod スキーマ・型
docs/              # 移植仕様書
```

## 環境構築

1. [Bun をインストール](https://bun.sh/docs/installation)する
2. clone して依存をインストール

```bash
git clone <このリポジトリ>
cd zaikoSystem
bun install
```

3. PostgreSQL を起動(初回はテーブル作成も)

```bash
docker compose up -d postgres

# 初回のみ: 業務テーブル + 認証テーブルを作成
cd apps/api && bunx drizzle-kit push --force && cd ../..
```

4. ログインユーザーを作成(サインアップ UI は無いため必須)

```bash
cd apps/api
SEED_PASSWORD=<パスワード> bun run scripts/seed-user.ts <メールアドレス> [表示名]
cd ../..
```

5. 開発サーバを起動

```bash
# ターミナル1: API (http://localhost:3000)
cd apps/api && bun run dev

# ターミナル2: SPA (http://localhost:5174)
cd apps/web && bun run dev
```

http://localhost:5174 を開いてログインする。

### すべて Docker で動かす場合

```bash
docker compose up
```

api(3000)・spa(5174)・postgres(5432)が起動する。

## 開発コマンド(リポジトリルート)

```bash
bun run check      # Biome lint + format チェック
bun run check:fix  # 自動修正
bun run typecheck  # 全ワークスペースの型チェック
bun run test       # 全ワークスペースのテスト
```

環境変数は `apps/api/.env.example` を参照(未設定でもローカル開発のデフォルトで動作する)。

## CI

GitHub Actions(`.github/workflows/ci.yml`)が PR / develop / main への push で
lint・typecheck・全テスト(使い捨て PostgreSQL 上)を実行する。
