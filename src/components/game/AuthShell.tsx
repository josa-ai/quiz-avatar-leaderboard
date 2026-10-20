import React from 'react';

export const authInput = 'w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20';
export const authButton = 'w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed';

export default function AuthShell({ title, subtitle, children, onBack }: {
  title: string; subtitle: string; children: React.ReactNode; onBack?: () => void;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md relative">
        {onBack && <button onClick={onBack} className="text-slate-300 hover:text-white mb-6">← Back to homepage</button>}
        <header className="text-center mb-8">
          <p className="text-cyan-300 text-sm font-bold tracking-widest mb-3">FINAL EXAM</p>
          <h1 className="text-3xl font-black text-white mb-3">{title}</h1>
          <p className="text-slate-300">{subtitle}</p>
        </header>
        <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-600/70 shadow-2xl">{children}</div>
      </div>
    </main>
  );
}
