import { createMiddleware } from 'hono/factory';
import { auth } from '../auth';

type SessionData = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/** requireAuth が Context にセットする変数の型。保護ルートの Hono ジェネリクスに渡す。 */
export type AuthEnv = {
  Variables: {
    user: SessionData['user'];
    session: SessionData['session'];
  };
};

/**
 * セッション必須ミドルウェア。未認証は 401 を返す。
 * レスポンス形は現行 Laravel の auth ミドルウェアに合わせる(migration-spec.md §5)。
 */
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ message: 'Unauthenticated.' }, 401);
  }
  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});
