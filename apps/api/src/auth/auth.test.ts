import { beforeAll, describe, expect, it } from 'bun:test';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { app } from '../app';
import { db } from '../db';
import * as authSchema from '../db/auth-schema';
import { requireAuth } from '../middleware/auth';

const TEST_EMAIL = 'auth-test@example.com';
const TEST_PASSWORD = 'password-for-test-1234';

beforeAll(async () => {
  // 冪等化: 前回実行のテストユーザーを消してから作り直す(session/account は FK cascade)
  await db.delete(authSchema.user).where(eq(authSchema.user.email, TEST_EMAIL));

  const seedAuth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-secret-zaiko-system',
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    basePath: '/api/auth',
    database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
    emailAndPassword: { enabled: true },
  });
  await seedAuth.api.signUpEmail({
    body: { email: TEST_EMAIL, password: TEST_PASSWORD, name: 'テストユーザー' },
  });
});

const signIn = (email: string, password: string) =>
  app.request('/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

describe('POST /api/auth/sign-in/email', () => {
  it('正しい資格情報でログインでき、セッションクッキーが発行される', async () => {
    const res = await signIn(TEST_EMAIL, TEST_PASSWORD);

    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('better-auth.session_token');
    const body = (await res.json()) as { user: { email: string } };
    expect(body.user.email).toBe(TEST_EMAIL);
  });

  it('誤ったパスワードは 401 を返す', async () => {
    const res = await signIn(TEST_EMAIL, 'wrong-password');

    expect(res.status).toBe(401);
  });

  it('存在しないユーザーは 401 を返す', async () => {
    const res = await signIn('no-such-user@example.com', TEST_PASSWORD);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/sign-up/email', () => {
  it('サインアップは無効化されている', async () => {
    const res = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'intruder@example.com',
        password: 'should-not-work-1234',
        name: 'intruder',
      }),
    });

    expect(res.status).not.toBe(200);
  });
});

describe('requireAuth ミドルウェア', () => {
  const protectedApp = new Hono()
    .use('*', requireAuth)
    .get('/secret', (c) => c.json({ email: c.get('user').email }));

  it('セッションなしは 401 と Laravel 互換メッセージを返す', async () => {
    const res = await protectedApp.request('/secret');

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: 'Unauthenticated.' });
  });

  it('ログイン済みセッションでアクセスできる', async () => {
    const loginRes = await signIn(TEST_EMAIL, TEST_PASSWORD);
    const cookie = loginRes.headers.get('set-cookie');
    expect(cookie).not.toBeNull();

    const res = await protectedApp.request('/secret', {
      headers: { cookie: cookie ?? '' },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: TEST_EMAIL });
  });
});
