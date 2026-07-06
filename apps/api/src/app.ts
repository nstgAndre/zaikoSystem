import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { auth } from './auth';

/**
 * zaikoSystem API 本体。ランタイム非依存で定義し、起動は index.ts が担う。
 * ルートは 1 リソース 1 ファイルで routes/ 配下に追加し、ここで app.route() する。
 */
const app = new Hono()
  .use('*', logger())
  .on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))
  .get('/health', (c) => c.json({ status: 'ok' }));

/** Hono RPC クライアント(hc)用のアプリ型。 */
type AppType = typeof app;

export type { AppType };
export { app };
