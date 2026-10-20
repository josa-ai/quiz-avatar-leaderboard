import React, { useState } from 'react';
import { User } from '@/types/game';
import { loginUser } from '@/lib/gameService';
import AuthShell, { authButton, authInput } from './AuthShell';

export default function LoginPage({ onLogin, onRegister, onBack }: {
  onLogin: (user: User, token: string) => void; onRegister: () => void; onBack: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await loginUser(email, password);
      if (result.error) setError(result.error);
      else if (result.data?.token) onLogin(result.data.user, result.data.token);
      else setError('Sign-in did not complete. Please try again.');
    } catch { setError('Unable to connect. Please try again.'); }
    finally { setBusy(false); }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your challenge." onBack={onBack}>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-slate-200 text-sm mb-2">Email</label>
          <input id="login-email" type="email" name="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className={authInput} />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-slate-200 text-sm mb-2">Password</label>
          <input id="login-password" type="password" name="password" autoComplete="current-password" required maxLength={128} value={password} onChange={e => setPassword(e.target.value)} className={authInput} />
        </div>
        {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
        <button type="submit" disabled={busy} className={authButton}>{busy ? 'Signing in…' : 'LOG IN'}</button>
        <p className="text-center text-slate-300 text-sm">New here? <button type="button" onClick={onRegister} className="text-cyan-300 underline">Register to test the software</button></p>
      </form>
    </AuthShell>
  );
}
