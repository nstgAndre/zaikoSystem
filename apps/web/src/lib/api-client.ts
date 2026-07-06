import type { AppType } from '@zaiko/api/app';
import { hc } from 'hono/client';

/**
 * Hono RPC クライアント。API の型が end-to-end で伝播する。
 * dev では Vite の /api プロキシ経由で同一オリジン通信する。
 */
export const api = hc<AppType>('/');
