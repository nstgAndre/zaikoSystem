import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';
import * as relations from './relations';
import * as schema from './schema';

// 認証情報は開発用 docker-compose.yml と同一(本番運用は想定しない検証リポジトリ)
const databaseUrl = process.env.DATABASE_URL ?? 'postgres://user:password@localhost:5432/sample';

const client = new SQL(databaseUrl);

/** 業務テーブル(items / stock_ins / stock_outs / logs)への Drizzle クライアント。 */
export const db = drizzle({ client, schema: { ...schema, ...relations } });

export * from './schema';
