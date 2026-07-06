import { type FormEventHandler, useState } from 'react';
import { Checkbox } from '../components/Checkbox';
import { InputError } from '../components/InputError';
import { InputLabel } from '../components/InputLabel';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextInput } from '../components/TextInput';
import { GuestLayout } from '../layouts/GuestLayout';
import { authClient } from '../lib/auth-client';

/** 現行 Laravel の認証失敗メッセージ(auth.failed)を踏襲。 */
const CREDENTIALS_ERROR = 'These credentials do not match our records.';

/**
 * ログイン画面。Pages/Auth/Login.tsx の忠実移植(migration-spec.md §2.1)。
 * 認証エラーは email フィールド下に表示し、成功時はフルリロードで /index へ遷移する
 * (現行の window.location.href 遷移を踏襲)。
 */
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [processing, setProcessing] = useState(false);

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setEmailError(undefined);

    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe: remember,
    });

    if (error) {
      setEmailError(CREDENTIALS_ERROR);
      setProcessing(false);
      return;
    }

    window.location.href = '/index';
  };

  return (
    <GuestLayout className="bg-deepblue">
      <h1 className="text-white text-center text-3xl">Login</h1>
      <form onSubmit={submit} className="max-w-md mx-auto">
        <div>
          <InputLabel htmlFor="email" value="Email" className="text-white" />

          <TextInput
            id="email"
            type="email"
            name="email"
            value={email}
            className="mt-1 block w-full"
            autoComplete="username"
            isFocused={true}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputError message={emailError} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password" value="Password" className="text-white" />

          <TextInput
            id="password"
            type="password"
            name="password"
            value={password}
            className="mt-1 block w-full"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="block mt-4">
          <label htmlFor="remember" className="flex items-center">
            <Checkbox
              id="remember"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="ms-2 text-sm text-gray-600 text-white">Remember me</span>
          </label>
        </div>

        <div className="flex items-center justify-center mt-4">
          <PrimaryButton className="ms-4" disabled={processing}>
            Log in
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}
