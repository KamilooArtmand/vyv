import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { AuthService } from '../services/authService';
import { toast } from '../state/ui';
import { IconButton } from './ui/IconButton';

export const inputClass =
  'h-12 w-full rounded-[var(--radius-md)] bg-surface-2 px-4 text-[15px] outline-none ring-1 ring-transparent transition placeholder:text-fg-3 focus:bg-surface focus:ring-line-2';

/** Minimal sign-in: two OAuth icons, or email in two fields. */
export function AuthForm({ onDone }: { onDone?: () => void }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (fn: () => Promise<boolean>) => {
    setBusy(true);
    setError('');
    const ok = await fn().catch(() => false);
    setBusy(false);
    if (ok) {
      toast('Signed in', 'check');
      onDone?.();
    } else setError('Check your email and password.');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={busy} onClick={() => run(() => AuthService.loginWithOAuth('Google'))} aria-label="Continue with Google" className="press flex h-12 items-center justify-center gap-2 rounded-full bg-surface-2 text-[14px] font-medium hover:bg-surface-3">
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          Google
        </button>
        <button type="button" disabled={busy} onClick={() => run(() => AuthService.loginWithOAuth('Facebook'))} aria-label="Continue with Facebook" className="press flex h-12 items-center justify-center gap-2 rounded-full bg-surface-2 text-[14px] font-medium hover:bg-surface-3">
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
            <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
          </svg>
          Facebook
        </button>
      </div>
      <div className="my-1 flex items-center gap-3 text-[12px] text-fg-3">
        <span className="h-px flex-1 bg-line-2" /> or <span className="h-px flex-1 bg-line-2" />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => AuthService.loginWithEmail(email, pass));
        }}
        className="flex flex-col gap-2"
      >
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" className={inputClass} />
        <input type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" aria-label="Password" className={inputClass} />
        {error && <p className="px-1 text-[13px] text-live">{error}</p>}
        <div className="mt-1 flex items-center gap-2">
          <button type="submit" disabled={busy} className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-fg text-[15px] font-medium text-bg disabled:opacity-60">
            {busy ? <span className="size-4 animate-spin rounded-full border-2 border-bg border-t-transparent" /> : <Mail size={17} />}
            Continue
          </button>
          <IconButton
            icon={ArrowRight}
            label="Create account"
            variant="soft"
            size="lg"
            onClick={() => run(() => AuthService.registerWithEmail(email.split('@')[0] || 'Listener', email, pass))}
          />
        </div>
      </form>
    </div>
  );
}
