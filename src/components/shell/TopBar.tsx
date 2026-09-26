import { useEffect, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight, Moon, Sparkles, Sun, UserRound } from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/format';
import { goBack, goForward, navigate, uiStore } from '../../state/ui';
import { applyTheme, resolveTheme, settingsStore } from '../../state/settings';
import { useUnreadCount } from '../../state/library';
import { authStore } from '../../state/auth';
import { IconButton } from '../ui/IconButton';
import { LogoMark, Wordmark } from '../ui/Logo';

export function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const pref = useStore(settingsStore, (s) => s.theme);
  const [, force] = useState(0);
  const dark = resolveTheme(pref) === 'dark';
  return (
    <IconButton
      icon={dark ? Sun : Moon}
      label={dark ? 'Light' : 'Dark'}
      size={size}
      tip="bottom"
      onClick={(e) => {
        const theme = dark ? 'light' : 'dark';
        settingsStore.set({ theme });
        applyTheme(theme, { x: e.clientX, y: e.clientY });
        force((n) => n + 1);
      }}
    />
  );
}

/** Sticky, glass-on-scroll top bar. */
export function TopBar({ onAgent }: { onAgent: () => void }) {
  const canBack = useStore(uiStore, (s) => s.back.length > 0);
  const canFwd = useStore(uiStore, (s) => s.forward.length > 0);
  const route = useStore(uiStore, (s) => s.route.name);
  const unread = useUnreadCount();
  const user = useStore(authStore, (s) => s.user);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById('main-scroll');
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 8);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-20 -mx-4 mb-2 flex h-16 items-center gap-2 px-4 pt-[env(safe-area-inset-top)] transition-[background,backdrop-filter,border-color] duration-300 md:-mx-8 md:px-8',
        scrolled ? 'border-b border-line bg-[var(--glass)] backdrop-blur-2xl backdrop-saturate-150' : 'border-b border-transparent',
      )}
    >
      {/* Mobile brand */}
      <button type="button" onClick={() => navigate({ name: 'home' })} className="press flex items-center gap-2 md:hidden" aria-label="Home">
        <LogoMark className="size-8" />
        <Wordmark />
      </button>

      <div className="hidden items-center gap-1 md:flex">
        <IconButton icon={ChevronLeft} label="Back" size="sm" variant="soft" tip="bottom" disabled={!canBack} onClick={goBack} />
        <IconButton icon={ChevronRight} label="Forward" size="sm" variant="soft" tip="bottom" disabled={!canFwd} onClick={goForward} />
      </div>

      {/* Agent command pill */}
      <button
        type="button"
        onClick={onAgent}
        className="press group ml-2 hidden h-10 max-w-md flex-1 items-center gap-2.5 rounded-full bg-surface-2 pl-3.5 pr-2 text-left text-[14px] text-fg-3 hover:bg-surface-3 md:flex"
      >
        <Sparkles size={16} strokeWidth={1.75} className="text-accent-ink" />
        <span className="flex-1 truncate">Ask vyv anything…</span>
        <kbd className="rounded-md border border-line-2 px-1.5 py-0.5 font-sans text-[11px] text-fg-3">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <IconButton icon={Sparkles} label="Agent" tip="bottom" className="md:hidden" onClick={onAgent} />
        <ThemeToggle />
        <IconButton
          icon={Bell}
          label="Inbox"
          tip="bottom"
          badge={unread}
          className={cn('md:hidden', route === 'notifications' && 'text-fg')}
          onClick={() => navigate({ name: 'notifications' })}
        />
        <button type="button" aria-label="Profile" onClick={() => navigate({ name: 'profile' })} className="press ml-1 md:hidden">
          {user ? (
            <img src={user.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-surface-2 text-fg-2">
              <UserRound size={16} strokeWidth={1.75} />
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
