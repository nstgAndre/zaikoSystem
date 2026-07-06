/**
 * テストユーザー作成スクリプト。本体の auth は disableSignUp のため、
 * サインアップを有効にした別インスタンスを組んで登録する(このスクリプト内限定)。
 *
 * 使い方: bun run scripts/seed-user.ts <email> <password> [name]
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../src/db';
import * as authSchema from '../src/db/auth-schema';

const [email, password, name] = process.argv.slice(2);
if (!email || !password) {
  console.error('使い方: bun run scripts/seed-user.ts <email> <password> [name]');
  process.exit(1);
}

const seedAuth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-secret-zaiko-system',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  basePath: '/api/auth',
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  emailAndPassword: { enabled: true },
});

const result = await seedAuth.api.signUpEmail({
  body: { email, password, name: name ?? email },
});

console.log(`ユーザーを作成しました: ${result.user.email} (id: ${result.user.id})`);
process.exit(0);
