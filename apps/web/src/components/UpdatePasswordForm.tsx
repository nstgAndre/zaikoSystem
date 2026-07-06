import { Transition } from '@headlessui/react';
import { type FormEventHandler, useRef, useState } from 'react';
import { authClient } from '../lib/auth-client';
import { InputError } from './InputError';
import { InputLabel } from './InputLabel';
import { PrimaryButton } from './PrimaryButton';
import { TextInput } from './TextInput';

interface FormErrors {
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

/**
 * パスワード変更フォーム(Breeze UpdatePasswordForm の移植、migration-spec.md §2.4)。
 * バックエンドは Better Auth の change-password に置換。確認用パスワードの一致検証は
 * クライアント側で行い、エラー文言は現行(Laravel 既定の英語)を踏襲する。
 * エラー時のフィールドリセット+フォーカス移動も現行同様。
 */
export function UpdatePasswordForm({ className = '' }: { className?: string }) {
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [processing, setProcessing] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);

  const updatePassword: FormEventHandler = async (e) => {
    e.preventDefault();
    setErrors({});
    setRecentlySuccessful(false);

    if (password !== passwordConfirmation) {
      setErrors({ password: 'The password confirmation does not match.' });
      setPassword('');
      setPasswordConfirmation('');
      passwordInput.current?.focus();
      return;
    }

    setProcessing(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword: password,
    });
    setProcessing(false);

    if (error) {
      if (error.code === 'INVALID_PASSWORD') {
        setErrors({ current_password: 'The password is incorrect.' });
        setCurrentPassword('');
        currentPasswordInput.current?.focus();
      } else {
        // 文字数不足など(Better Auth 既定は 8 文字以上)
        setErrors({ password: error.message ?? 'The password is invalid.' });
        setPassword('');
        setPasswordConfirmation('');
        passwordInput.current?.focus();
      }
      return;
    }

    setCurrentPassword('');
    setPassword('');
    setPasswordConfirmation('');
    setRecentlySuccessful(true);
  };

  return (
    <section className={className}>
      <form onSubmit={updatePassword} className="mt-6 space-y-6">
        <Transition
          show={recentlySuccessful}
          enter="transition ease-in-out"
          enterFrom="opacity-0"
          leave="transition ease-in-out"
          leaveTo="opacity-0"
        >
          <p className="text-sm text-red-600">パスワード更新されました</p>
        </Transition>
        <div>
          <InputLabel htmlFor="current_password" value="旧パスワード" />

          <TextInput
            id="current_password"
            ref={currentPasswordInput}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            type="password"
            className="mt-1 block w-full"
            autoComplete="current-password"
          />

          <InputError message={errors.current_password} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password" value="新しいパスワード" />

          <TextInput
            id="password"
            ref={passwordInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 block w-full"
            autoComplete="new-password"
          />

          <InputError message={errors.password} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password_confirmation" value="新しいパスワード(確認用)" />

          <TextInput
            id="password_confirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            type="password"
            className="mt-1 block w-full"
            autoComplete="new-password"
          />

          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={processing}>保存</PrimaryButton>
        </div>
      </form>
    </section>
  );
}
