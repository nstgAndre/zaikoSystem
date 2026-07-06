import { UpdatePasswordForm } from '../components/UpdatePasswordForm';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';
import { authClient } from '../lib/auth-client';

/**
 * Profile(パスワード変更)画面(現行 Pages/Profile/Edit.tsx の忠実移植・縮小)。
 * 現行で実際に描画されるのは UpdatePasswordForm のみ。名前・メール変更と退会は
 * 死にコードのため移植しない(migration-spec.md §2.4)。
 */
export function ProfilePage() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return null;
  }

  return (
    <AuthenticatedLayout
      user={session.user}
      header={<h2 className="text-lg font-medium text-gray-900t">パスワード更新</h2>}
    >
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
            <UpdatePasswordForm className="max-w-xl" />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
