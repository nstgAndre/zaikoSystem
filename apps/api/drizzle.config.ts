import { defineConfig } from 'drizzle-kit';

// 認証情報は開発用 docker-compose.yml と同一(本番運用は想定しない検証リポジトリ)
const databaseUrl = process.env.DATABASE_URL ?? 'postgres://user:password@localhost:5432/sample';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  // 業務テーブルのみ管理対象。Laravel 固有テーブルと認証系(Better Auth が生成)は対象外
  tablesFilter: ['items', 'stock_ins', 'stock_outs', 'logs'],
});
