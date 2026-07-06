import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './Login';

const signInEmail = vi.hoisted(() => vi.fn());

vi.mock('../lib/auth-client', () => ({
  authClient: {
    signIn: { email: signInEmail },
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    signInEmail.mockReset();
  });

  it('Email・Password・Remember me・Log in を表示する', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Remember me/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('認証失敗時は email フィールド下にエラーを表示する', async () => {
    signInEmail.mockResolvedValue({ data: null, error: { status: 401 } });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(
      await screen.findByText('These credentials do not match our records.'),
    ).toBeInTheDocument();
    expect(signInEmail).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrong-password',
      rememberMe: false,
    });
  });

  it('Remember me のチェック状態を signIn に渡す', async () => {
    signInEmail.mockResolvedValue({ data: null, error: { status: 401 } });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByLabelText(/Remember me/));
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(signInEmail).toHaveBeenCalledWith(expect.objectContaining({ rememberMe: true }));
  });
});
