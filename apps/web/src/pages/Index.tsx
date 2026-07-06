import { authClient } from '../lib/auth-client';

/**
 * 在庫管理一覧画面のプレースホルダ。本実装(一覧・検索・ページネーション・行編集)は
 * PR4 で移植する。ここでは認証ガードとログアウトの疎通確認のみ。
 */
export function IndexPage() {
  const { data: session } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-gray-800">在庫管理一覧(PR4 で移植)</h1>
      <p className="text-gray-600">{session?.user.email}</p>
      <button
        type="button"
        onClick={signOut}
        className="px-4 py-2 bg-deepblue text-white rounded-md text-sm"
      >
        Log Out
      </button>
    </main>
  );
}
