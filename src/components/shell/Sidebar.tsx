import { Bell, Settings2, Sparkles, UserRound } from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/format';
import { navigate, togglePanel, uiStore } from '../../state/ui';
import { useUnreadCount } from '../../state/library';
import { authStore } from '../../state/auth';
import { playerStore } from '../../state/player';
import { LogoMark } from '../ui/Logo';
import { IconButton } from '../ui/IconButton';
import { NAV_GROUPS, isActive } from './nav';

/** Icon-only navigation rail (tablet & desktop). */
export function Sidebar() {
  const route = useStore(uiStore, (s) => s.route.name);
  const panel = useStore(uiStore, (s) => s.panel);
  const unread = useUnreadCount();
  const user = useStore(authStore, (s) => s.user);
  const isPlaying = useStore(playerStore, (s) => s.isPlaying);

  return (
    <nav aria-label="Primary" className="scrollbar-none relative z-30 flex h-full w-[76px] shrink-0 flex-col items-center gap-1 overflow-y-auto py-4">
      <button type="button" aria-label="Home" onClick={() => navigate({ name: 'home' })} className="press mb-3">
        <LogoMark className="size-9" animated={isPlaying} />
      </button>

      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className="flex flex-col items-center gap-1">
          {gi > 0 && <span className="my-2 h-px w-6 bg-line-2" />}
          {group.map((item) => {
            const on = isActive(item, route);
            return (
              <div key={item.name} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    'absolute -left-[18px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-fg transition-all duration-500 [transition-timing-function:var(--ease-spring)]',
                    on ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
                  )}
                />
                <IconButton
                  icon={item.icon}
                  label={item.label}
                  tip="right"
                  aria-current={on ? 'page' : undefined}
                  className={cn('!rounded-[14px]', on && '!bg-surface-2 !text-fg')}
                  onClick={() => navigate({ name: item.name })}
                />
              </div>
            );
          })}
        </div>
      ))}

      <div className="mt-auto flex flex-col items-center gap-1 pt-4">
        <IconButton icon={Sparkles} label="Agent" tip="right" className="!rounded-[14px]" active={panel === 'agent'} onClick={() => togglePanel('agent')} />
        <IconButton icon={Bell} label="Inbox" tip="right" className={cn('!rounded-[14px]', route === 'notifications' && '!bg-surface-2 !text-fg')} badge={unread} onClick={() => navigate({ name: 'notifications' })} />
        <IconButton icon={Settings2} label="Settings" tip="right" className={cn('!rounded-[14px]', route === 'settings' && '!bg-surface-2 !text-fg')} onClick={() => navigate({ name: 'settings' })} />
        <button
          type="button"
          aria-label="Profile"
          data-tip="Profile"
          data-tip-side="right"
          onClick={() => navigate({ name: 'profile' })}
          className={cn('press mt-2 rounded-full p-0.5 ring-2 transition', route === 'profile' ? 'ring-accent' : 'ring-transparent hover:ring-line-2')}
        >
          {user ? (
            <img src={user.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-fg-2">
              <UserRound size={18} strokeWidth={1.75} />
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
