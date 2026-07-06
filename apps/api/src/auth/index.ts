import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import * as authSchema from '../db/auth-schema';

// 本番相当環境では既知の固定値へのフォールバックを許さない(セッション偽造につながる)
const envSecret = process.env.BETTER_AUTH_SECRET;
if (!envSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BETTER_AUTH_SECRET は production では必須です');
  }
  console.warn('[auth] BETTER_AUTH_SECRET 未設定。開発用の弱いシークレットで動作します');
}
const secret = envSecret ?? 'dev-only-secret-zaiko-system';

/**
 * zaikoSystem の認証本体。Laravel Breeze のセッション認証の後継。
 * 提供するのはログイン・ログアウト・セッション取得・パスワード変更のみ
 * (migration-spec.md §5.2)。ユーザー登録・メール認証・パスワードリセットは提供しない。
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
  // Better Auth はデフォルトで全エンドポイントを登録するため、仕様外(§5.2)の
  // ユーザー情報変更・セッション/アカウント管理系は 404 にする
  disabledPaths: [
    '/update-user',
    '/change-email',
    '/delete-user',
    '/list-sessions',
    '/revoke-session',
    '/revoke-sessions',
    '/revoke-other-sessions',
    '/list-accounts',
    '/account-info',
  ],
  session: {
    // Breeze の Remember me 相当は Better Auth の rememberMe(署名クッキーの寿命延長)で代替
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type Auth = typeof auth;
