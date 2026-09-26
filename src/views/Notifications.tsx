import { useState } from 'react';
import { Bell, BellOff, CheckCheck, Disc3, Podcast, Settings2, Sparkles, Trash2, Users } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn, relativeTime } from '../lib/format';
import { clearNotifications, libraryStore, markRead } from '../state/library';
import { settingsStore } from '../state/settings';
import { navigate } from '../state/ui';
import { IconButton } from '../components/ui/IconButton';
import { EmptyState, PageHeader } from '../components/ui/Layout';
import type { NotificationItem, NotificationType } from '../types';

const TYPE: Record<NotificationType, { icon: typeof Bell; color: string; label: string }> = {
  agent: { icon: Sparkles, color: 'var(--accent)', label: 'Agent' },
  release: { icon: Disc3, color: '#ec4899', label: 'Releases' },
  podcast: { icon: Podcast, color: '#f97316', label: 'Podcasts' },
  social: { icon: Users, color: '#10b981', label: 'Social' },
  system: { icon: Settings2, color: '#64748b', label: 'System' },
};

function bucket(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  return h < 24 ? 'Today' : h < 24 * 7 ? 'This week' : 'Earlier';
}

function Row({ n }: { n: NotificationItem }) {
  const t = TYPE[n.type];
  const Icon = t.icon;
  return (
    <button
      type="button"
      onClick={() => {
        markRead(n.id);
        n.route && navigate(n.route);
      }}
      className="press group flex w-full items-start gap-3.5 rounded-[var(--radius-lg)] p-3 text-left hover:bg-surface-2"
    >
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full" style={{ background: `color-mix(in oklab, ${t.color} 16%, transparent)`, color: t.color }}>
        <Icon size={19} strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cn('truncate text-[14.5px]', n.read ? 'font-medium text-fg-2' : 'font-semibold')}>{n.title}</span>
          <span className="shrink-0 text-[12px] text-fg-3 tabular">{relativeTime(n.time)}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[13.5px] text-fg-3">{n.content}</span>
      </span>
      <span className={cn('mt-2 size-2 shrink-0 rounded-full bg-accent transition-opacity', n.read && 'opacity-0')} />
    </button>
  );
}

export default function Notifications() {
  const items = useStore(libraryStore, (s) => s.notifications);
  const enabled = useStore(settingsStore, (s) => s.notifications);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const shown = items.filter((n) => filter === 'all' || n.type === filter);
  const groups = ['Today', 'This week', 'Earlier']
    .map((g) => [g, shown.filter((n) => bucket(n.time) === g)] as const)
    .filter(([, list]) => list.length);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Inbox"
        subtitle={`${items.filter((n) => !n.read).length} unread`}
        actions={
          <>
            <IconButton icon={enabled ? Bell : BellOff} label={enabled ? 'Mute' : 'Unmute'} variant="soft" active={enabled} onClick={() => settingsStore.set({ notifications: !enabled })} />
            <IconButton icon={CheckCheck} label="Mark all read" variant="soft" onClick={() => markRead()} />
            <IconButton icon={Trash2} label="Clear" variant="soft" onClick={clearNotifications} />
          </>
        }
      />
      <div className="scrollbar-none anim-rise -mx-4 mb-6 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
        {(['all', ...Object.keys(TYPE)] as (NotificationType | 'all')[]).map((k) => {
          const meta = k === 'all' ? { icon: Bell, label: 'All' } : TYPE[k];
          const Icon = meta.icon;
          return (
            <button
              key={k}
              type="button"
              aria-label={meta.label}
              data-tip={meta.label}
              data-tip-side="bottom"
              onClick={() => setFilter(k)}
              className={cn('press flex size-9 shrink-0 items-center justify-center rounded-full', filter === k ? 'bg-fg text-bg' : 'bg-surface-2 text-fg-2 hover:text-fg')}
            >
              <Icon size={16} strokeWidth={1.75} />
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={Bell} title="All caught up" />
      ) : (
        groups.map(([g, list]) => (
          <section key={g} className="mb-6">
            <h2 className="mb-1 px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">{g}</h2>
            <div className="stagger flex flex-col">
              {list.map((n) => (
                <Row key={n.id} n={n} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
