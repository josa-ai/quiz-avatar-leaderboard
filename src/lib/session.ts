import { User } from '@/types/game';

// Cached profile objects are never authentication. Only restore a token, then
// ask the server for its current account before showing authenticated screens.
export function readSessionToken(): string | null {
  try { localStorage.removeItem('finalexam_user'); } catch { /* Optional legacy cleanup. */ }
  for (const kind of ['sessionStorage', 'localStorage'] as const) {
    try {
      const token = window[kind].getItem('finalexam_token');
      if (token) return token;
    } catch { /* Try the other storage mechanism. */ }
  }
  return null;
}

export function clearSession(): void {
  for (const kind of ['localStorage', 'sessionStorage'] as const) {
    try {
      const storage = window[kind];
      storage.removeItem('finalexam_token');
      storage.removeItem('finalexam_user');
    } catch { /* Storage may be disabled. In-memory state is still cleared. */ }
  }
}

export function storeSession(user: User, token: string): void {
  clearSession();
  // Administrator tokens do not survive closing the browser tab.
  try { (user.isAdmin ? sessionStorage : localStorage).setItem('finalexam_token', token); } catch { /* In-memory login still works. */ }
}
