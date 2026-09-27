import { House, LayoutGrid, Library, Search, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/format';
import { navigate, openSheet, uiStore } from '../../state/ui';
import { ALL_NAV, isActive } from './nav';
import type { RouteName } from '../../types';

const PRIMARY: RouteName[] = ['home', 'search', 'library'];

/** Phone tab bar — icons only, the Agent sits in the middle. */
export function BottomNav({ onAgent }: { onAgent: () => void }) {
  const route = useStore(uiStore, (s) => s.route.name);
  const inPrimary = ALL_NAV.filter((n) => PRIMARY.includes(n.name)).some((n) => isActive(n, route));

  const Tab = ({ icon: Icon, label, on, onClick }: { icon: typeof House; label: string; on: boolean; onClick: () => void }) => (
    <button type="button" aria-label={label} aria-current={on ? 'page' : undefined} onClick={onClick} className="press flex flex-1 flex-col items-center justify-center gap-1">
      <Icon size={22} strokeWidth={on ? 2.1 : 1.6} className={cn('transition-colors', on ? 'text-fg' : 'text-fg-3')} />
      <span className={cn('size-1 rounded-full transition-all', on ? 'bg-fg' : 'bg-transparent')} />
    </button>
  );

  return (
    <nav aria-label="Tabs" className="glass flex h-[var(--nav-h)] items-stretch rounded-full border border-line-2 px-3 shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
      <Tab icon={House} label="Home" on={route === 'home'} onClick={() => navigate({ name: 'home' })} />
      <Tab icon={Search} label="Search" on={route === 'search'} onClick={() => navigate({ name: 'search' })} />
      <button type="button" aria-label="Agent" onClick={onAgent} className="press flex flex-1 items-center justify-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-fg text-bg shadow-[0_8px_24px_-8px_var(--accent)]">
          <Sparkles size={20} strokeWidth={1.9} />
        </span>
      </button>
      <Tab icon={Library} label="Library" on={route === 'library' || route === 'playlist'} onClick={() => navigate({ name: 'library' })} />
      <Tab icon={LayoutGrid} label="More" on={!inPrimary && route !== 'home'} onClick={() => openSheet('more')} />
    </nav>
  );
}
