import React, { useState } from 'react';
import { User } from '@/types/game';
import { registerUser } from '@/lib/gameService';
import AuthShell, { authButton, authInput } from './AuthShell';

interface RegisterPageProps {
  onRegister: (user: User, token: string) => void;
  onBack: () => void;
  onLogin: () => void;
}

export default function RegisterPage({ onRegister, onBack, onLogin }: RegisterPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await registerUser(email, fullName, password, marketingOptIn, adultConfirmed);
      if (result.error) setError(result.error);
      else if (result.data?.token) onRegister(result.data.user, result.data.token);
      else setError('Registration did not complete. Please try again.');
    } catch { setError('Unable to connect. Please try again.'); }
    finally { setBusy(false); }
  }

  return (
    <AuthShell title="Try the challenge" subtitle="Create your free adult tester account to start playing." onBack={onBack}>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="register-name" className="block text-slate-200 text-sm mb-2">Full name</label>
          <input id="register-name" name="name" autoComplete="name" required maxLength={120} value={fullName} onChange={e => setFullName(e.target.value)} className={authInput} />
        </div>
        <div>
          <label htmlFor="register-email" className="block text-slate-200 text-sm mb-2">Email</label>
          <input id="register-email" name="email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={e => setEmail(e.target.value)} className={authInput} />
        </div>
        <div>
          <label htmlFor="register-password" className="block text-slate-200 text-sm mb-2">Password</label>
          <input id="register-password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} aria-describedby="password-help" value={password} onChange={e => setPassword(e.target.value)} className={authInput} />
          <p id="password-help" className="text-slate-400 text-xs mt-2">Use at least 12 characters. You will use this password to log in again.</p>
        </div>
        <label className="flex items-start gap-3 text-sm text-slate-200 cursor-pointer">
          <input type="checkbox" required checked={adultConfirmed} onChange={e => setAdultConfirmed(e.target.checked)} className="mt-1 accent-cyan-400" />
          <span>I confirm that I am 18 or older.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-200 cursor-pointer">
          <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)} className="mt-1 accent-cyan-400" />
          <span>I would like to receive emails about Final Exam news, testing opportunities, and updates. <span className="text-slate-400">(Optional)</span></span>
        </label>
        <p className="text-xs text-slate-400">Your name and email are private. A separate player name is used in the game.</p>
        {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
        <button type="submit" disabled={busy} className={authButton}>{busy ? 'Creating account…' : 'REGISTER & PLAY'}</button>
        <p className="text-center text-slate-300 text-sm">Already registered? <button type="button" onClick={onLogin} className="text-cyan-300 underline">Log in</button></p>
      </form>
    </AuthShell>
  );
}
