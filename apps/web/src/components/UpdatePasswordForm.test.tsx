import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdatePasswordForm } from './UpdatePasswordForm';

const mockChangePassword = vi.hoisted(() => vi.fn());

vi.mock('../lib/auth-client', () => ({
  authClient: { changePassword: mockChangePassword },
}));

const fill = async (
  user: ReturnType<typeof userEvent.setup>,
  current: string,
  next: string,
  confirm: string,
) => {
  await user.type(screen.getByLabelText('旧パスワード'), current);
  await user.type(screen.getByLabelText('新しいパスワード'), next);
  await user.type(screen.getByLabelText('新しいパスワード(確認用)'), confirm);
  await user.click(screen.getByRole('button', { name: '保存' }));
};

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    mockChangePassword.mockReset();
  });

  it('確認用パスワード不一致はクライアント側でエラー表示し API を呼ばない', async () => {
    const user = userEvent.setup();
    render(<UpdatePasswordForm />);

    await fill(user, 'old-pass', 'new-pass-1234', 'different');

    expect(
      await screen.findByText('The password confirmation does not match.'),
    ).toBeInTheDocument();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('現在のパスワード誤りは旧パスワード欄にエラーを表示する', async () => {
    mockChangePassword.mockResolvedValue({
      data: null,
      error: { code: 'INVALID_PASSWORD', message: 'Invalid password' },
    });
    const user = userEvent.setup();
    render(<UpdatePasswordForm />);

    await fill(user, 'wrong-old', 'new-pass-1234', 'new-pass-1234');

    expect(await screen.findByText('The password is incorrect.')).toBeInTheDocument();
  });

  it('成功時は「パスワード更新されました」を表示しフォームをリセットする', async () => {
    mockChangePassword.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    render(<UpdatePasswordForm />);

    await fill(user, 'old-pass', 'new-pass-1234', 'new-pass-1234');

    expect(await screen.findByText('パスワード更新されました')).toBeInTheDocument();
    expect(mockChangePassword).toHaveBeenCalledWith({
      currentPassword: 'old-pass',
      newPassword: 'new-pass-1234',
    });
    expect(screen.getByLabelText('旧パスワード')).toHaveValue('');
  });
});
