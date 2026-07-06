import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import * as authSchema from '../db/auth-schema';

// シークレットは開発用フォールバック(本番運用は想定しない検証リポジトリ)。
// CI・コンテナでは BETTER_AUTH_SECRET を注入する。
const secret = process.env.BETTER_AUTH_SECRET ?? 'dev-only-secret-zaiko-system';

/**
 * zaikoSystem の認証本体。Laravel Breeze のセッション認証の後継。
 * ログイン(email+password)のみ提供し、ユーザー登録・メール認証・
 * パスワードリセットは提供しない(migration-spec.md §5)。
 * ユーザー作成はシードスクリプト(scripts/seed-user.ts)経由でのみ行う。
 */
export const auth = betterAuth({
  secret,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  basePath: '/api/auth',
  trustedOrigins: ['http://localhost:5174'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    // Breeze の Remember me 相当は Better Auth の rememberMe(署名クッキーの寿命延長)で代替
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type Auth = typeof auth;
