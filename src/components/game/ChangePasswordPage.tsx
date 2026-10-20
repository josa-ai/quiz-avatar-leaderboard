import React, { useState } from 'react';
import { User } from '@/types/game';
import { changePassword } from '@/lib/gameService';
import AuthShell, { authButton, authInput } from './AuthShell';

export default function ChangePasswordPage({ required, onChanged, onBack }: {
  required: boolean; onChanged: (user: User, token: string) => void; onBack: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    if (newPassword !== confirmPassword) { setError('The new passwords do not match.'); return; }
    setBusy(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.error) setError(result.error);
      else if (result.data?.token) onChanged(result.data.user, result.data.token);
    } catch { setError('Unable to connect. Please try again.'); }
    finally { setBusy(false); setCurrentPassword(''); }
  }
  return (
    <AuthShell title="Choose a new password" subtitle={required ? 'Replace your temporary password before continuing.' : 'Set a strong password for your account.'}>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="current-password" className="block text-slate-200 text-sm mb-2">Current password</label>
          <input id="current-password" type="password" autoComplete="current-password" required maxLength={128} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={authInput} />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-slate-200 text-sm mb-2">New password</label>
          <input id="new-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={authInput} />
          <p className="text-slate-400 text-xs mt-2">Use 12 or more characters. A unique passphrase works well.</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-slate-200 text-sm mb-2">Confirm new password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={authInput} />
        </div>
        <p className="text-slate-400 text-xs">Changing your password signs out other sessions.</p>
        {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
        <button type="submit" disabled={busy} className={authButton}>{busy ? 'Updating password…' : 'SAVE NEW PASSWORD'}</button>
        <button type="button" onClick={onBack} disabled={busy} className="w-full text-slate-300 py-2">{required ? 'Sign out' : 'Cancel'}</button>
      </form>
    </AuthShell>
  );
}
