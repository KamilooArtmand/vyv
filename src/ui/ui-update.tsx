// ─────────────────────────────────────────────────────────────
// ui-update.tsx: "A new version is ready" — desktop and web
//
// Desktop: electron-updater downloads signed releases in the
// background; we offer a restart. Web: every deploy changes the
// hashed entry script, so we poll index.html and offer a reload.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { desktop } from '../core/core-desktop';

const entryScript = (html: string) => html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1] ?? null;

export function UpdateBanner() {
  const [ready, setReady] = useState<null | { label: string; act: () => void }>(null);

  useEffect(() => {
    if (desktop) {
      return desktop.onUpdate((s) => {
        if (s.state === 'downloaded') setReady({ label: `vyv ${s.version ?? ''} is ready`, act: () => desktop!.installUpdate() });
      });
    }
    if (import.meta.env.DEV) return;
    const current = entryScript(document.documentElement.outerHTML);
    const check = async () => {
      try {
        const html = await (await fetch('/index.html', { cache: 'no-store' })).text();
        const latest = entryScript(html);
        if (current && latest && latest !== current) setReady({ label: 'A new version of vyv is ready', act: () => location.reload() });
      } catch {
        /* offline */
      }
    };
    const t = window.setInterval(check, 20 * 60_000);
    return () => window.clearInterval(t);
  }, []);

  if (!ready) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(var(--header-h)+8px)] z-[80] flex justify-center px-4">
      <div className="glass-strong anim-pop pointer-events-auto flex items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5 text-[13.5px] font-medium shadow-xl">
        <span>{ready.label}</span>
        <button type="button" onClick={ready.act} className="press flex h-8 items-center gap-1.5 rounded-full bg-fg px-3.5 text-[12.5px] font-semibold text-bg">
          <RefreshCw size={13} /> Restart
        </button>
      </div>
    </div>
  );
}
