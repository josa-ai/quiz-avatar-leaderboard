import React, { useState } from 'react';
import { exportContacts } from '@/lib/gameService';
import AuthShell, { authButton, authInput } from './AuthShell';

export default function ContactsExportPage({ onBack }: { onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [optedInOnly, setOptedInOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function download(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const result = await exportContacts(password, optedInOnly);
      if (result.error) { setError(result.error); return; }
      if (!result.data) { setError('The export did not complete. Please try again.'); return; }
      const url = URL.createObjectURL(new Blob([result.data.csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url; link.download = result.data.filename;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`CSV downloaded: ${result.data.count} contact${result.data.count === 1 ? '' : 's'}.`);
    } catch { setError('Unable to download. Please try again.'); }
    finally { setBusy(false); setPassword(''); }
  }
  return (
    <AuthShell title="Export tester contacts" subtitle="Administrator access" >
      <form onSubmit={download} className="space-y-5">
        <p className="text-slate-300 text-sm">Download names, email addresses, registration dates, and recorded email preferences. Administrator accounts are excluded.</p>
        <label className="flex items-start gap-3 text-sm text-slate-200 cursor-pointer">
          <input type="checkbox" checked={optedInOnly} onChange={e => setOptedInOnly(e.target.checked)} className="mt-1 accent-cyan-400" />
          <span>Only include testers who opted in to project emails</span>
        </label>
        <p className="text-slate-400 text-xs">An account alone does not record permission for promotional email. Older accounts show “Not recorded.”</p>
        <div>
          <label htmlFor="export-password" className="block text-slate-200 text-sm mb-2">Confirm your password</label>
          <input id="export-password" type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={e => setPassword(e.target.value)} className={authInput} />
        </div>
        {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
        {message && <p role="status" className="text-green-300 text-sm">{message}</p>}
        <button type="submit" disabled={busy} className={authButton}>{busy ? 'Preparing CSV…' : 'DOWNLOAD CONTACTS CSV'}</button>
        <button type="button" onClick={onBack} className="w-full text-slate-300 py-2">Back to game</button>
      </form>
    </AuthShell>
  );
}
