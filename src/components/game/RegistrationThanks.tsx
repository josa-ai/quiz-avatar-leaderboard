import { useEffect, useState } from 'react';
import AuthShell, { authButton } from './AuthShell';

export default function RegistrationThanks({ onComplete }: { onComplete: () => void }) {
  const [seconds, setSeconds] = useState(6);
  useEffect(() => {
    const deadline = Date.now() + 6000;
    const interval = window.setInterval(() => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 200);
    const timeout = window.setTimeout(onComplete, 6000);
    return () => { window.clearInterval(interval); window.clearTimeout(timeout); };
  }, [onComplete]);
  return (
    <AuthShell title="Thank you for registering!" subtitle="Your account is ready. Let’s see what you know.">
      <div className="text-center">
        <p className="text-cyan-300 text-6xl font-black my-6" aria-hidden="true">{seconds}</p>
        <p className="text-slate-300 mb-8" role="status">Taking you to the game in six seconds…</p>
        <button className={authButton} onClick={onComplete}>START NOW</button>
      </div>
    </AuthShell>
  );
}
