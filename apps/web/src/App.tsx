import { APP_NAME } from '@zaiko/shared';

/**
 * SPA のルートコンポーネント。ルーティング(TanStack Router)は PR3 以降で導入し、
 * ここでは基盤疎通確認用のプレースホルダのみ表示する。
 */
export function App() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-800">{APP_NAME}(リプレイス基盤)</h1>
    </main>
  );
}
