/**
 * テストユーザー作成スクリプト。本体の auth は disableSignUp のため、
 * サインアップを有効にした別インスタンスを組んで登録する(このスクリプト内限定)。
 *
 * 使い方:
 *   SEED_PASSWORD=<password> bun run scripts/seed-user.ts <email> [name]   ← 推奨
 *   bun run scripts/seed-user.ts <email> <password> [name]                 ← 引数渡し
 *     (引数渡しは shell history / ps にパスワードが残る点に注意)
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../src/db';
import * as authSchema from '../src/db/auth-schema';

const args = process.argv.slice(2);
const email = args[0];
const password = process.env.SEED_PASSWORD ?? (args.length >= 2 ? args[1] : undefined);
const name = process.env.SEED_PASSWORD ? args[1] : args[2];

if (!email || !password) {
  console.error(
    '使い方: SEED_PASSWORD=<password> bun run scripts/seed-user.ts <email> [name]\n' +
      '        bun run scripts/seed-user.ts <email> <password> [name]',
  );
  process.exit(1);
}

const seedAuth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-secret-zaiko-system',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  basePath: '/api/auth',
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  emailAndPassword: { enabled: true },
});

try {
  const result = await seedAuth.api.signUpEmail({
    body: { email, password, name: name ?? email },
  });
  console.log(`ユーザーを作成しました: ${result.user.email} (id: ${result.user.id})`);
  process.exit(0);
} catch (err) {
  const code =
    typeof err === 'object' && err !== null && 'body' in err
      ? (err as { body?: { code?: string } }).body?.code
      : undefined;
  if (code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
    console.error(`エラー: ${email} はすでに登録されています`);
  } else {
    console.error('エラー: ユーザー作成に失敗しました', err);
  }
  process.exit(1);
}
