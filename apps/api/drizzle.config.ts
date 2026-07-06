import { defineConfig } from 'drizzle-kit';

// 認証情報は開発用 docker-compose.yml と同一(本番運用は想定しない検証リポジトリ)
const databaseUrl = process.env.DATABASE_URL ?? 'postgres://user:password@localhost:5432/sample';

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/db/schema.ts', './src/db/auth-schema.ts'],
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  // 業務テーブル + Better Auth 認証テーブルのみ管理対象。Laravel 固有テーブルは対象外
  tablesFilter: [
    'items',
    'stock_ins',
    'stock_outs',
    'logs',
    'user',
    'session',
    'account',
    'verification',
  ],
});
