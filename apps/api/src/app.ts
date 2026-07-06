import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { auth } from './auth';
import { itemRoutes } from './routes/items';

/**
 * zaikoSystem API 本体。ランタイム非依存で定義し、起動は index.ts が担う。
 * ルートは 1 リソース 1 ファイルで routes/ 配下に追加し、ここで app.route() する。
 */
const app = new Hono()
  .use('*', logger())
  .onError((err, c) => {
    // この API はすべて JSON を返す。Hono デフォルトの text/plain 500 を防ぐ
    console.error(err);
    return c.json({ message: 'Internal Server Error' }, 500);
  })
  .on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))
  .get('/health', (c) => c.json({ status: 'ok' }))
  .route('/api/items', itemRoutes);

/** Hono RPC クライアント(hc)用のアプリ型。 */
type AppType = typeof app;

export type { AppType };
export { app };
