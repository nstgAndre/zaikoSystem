import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthenticatedLayout } from './AuthenticatedLayout';

vi.mock('../lib/auth-client', () => ({
  authClient: { signOut: vi.fn() },
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children?: React.ReactNode }) => (
    <a href={String(to)} {...props}>
      {children}
    </a>
  ),
  useRouterState: () => '/index',
}));

const user = { name: 'テスト太郎', email: 'taro@example.com' };

describe('AuthenticatedLayout', () => {
  it('PC ナビにロゴ(/index リンク)・在庫一覧・ユーザー名ドロップダウンを表示する(§7.7)', () => {
    render(<AuthenticatedLayout user={user}>content</AuthenticatedLayout>);

    const logo = screen.getByAltText('在庫管理');
    expect(logo.closest('a')).toHaveAttribute('href', '/index');
    expect(screen.getByText('在庫一覧').closest('a')).toHaveAttribute('href', '/index');
    expect(screen.getByRole('button', { name: /テスト太郎/ })).toBeInTheDocument();
  });

  it('ドロップダウンを開くと Profile リンクと Log Out ボタンが現れる(§7.7)', async () => {
    const u = userEvent.setup();
    render(<AuthenticatedLayout user={user}>content</AuthenticatedLayout>);

    // 閉時はモバイルメニュー分の 1 箇所のみ(ドロップダウンは DOM 未描画)
    expect(screen.getAllByText('Profile').length).toBe(1);

    await u.click(screen.getByRole('button', { name: /テスト太郎/ }));

    const profileLinks = screen.getAllByText('Profile');
    expect(profileLinks.length).toBe(2);
    for (const link of profileLinks) {
      expect(link.closest('a')).toHaveAttribute('href', '/profile');
    }
    expect(screen.getAllByRole('button', { name: 'Log Out' }).length).toBe(2);
  });

  it('モバイルメニューにユーザー名・メール、現行踏襲の Dashboard リンクを表示する(§7.7)', () => {
    render(<AuthenticatedLayout user={user}>content</AuthenticatedLayout>);

    // ユーザー名は PC ドロップダウンボタンとモバイルメニューの 2 箇所
    expect(screen.getAllByText('テスト太郎').length).toBe(2);
    expect(screen.getByText('taro@example.com')).toBeInTheDocument();
    // Breeze 残骸の Dashboard リンク(リンク先ページなし)も現行どおり(⚠️要確認 D は忠実再現で決定)
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
  });
});
