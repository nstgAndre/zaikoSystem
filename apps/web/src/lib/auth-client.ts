import { createAuthClient } from 'better-auth/react';

/** 認証クライアント。API とは Vite の /api プロキシ経由で同一オリジン通信する。 */
export const authClient = createAuthClient();
