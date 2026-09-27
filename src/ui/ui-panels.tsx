// ─────────────────────────────────────────────────────────────
// ui-panels.tsx: Queue & Side Panels
// ─────────────────────────────────────────────────────────────

import { ListMusic, MicVocal, Sparkles, X } from 'lucide-react';
import { useStore } from '../core/core-store';
import { playerStore, removeFromQueue } from '../state/state-player';
import { togglePanel, uiStore } from '../state/state-ui';
import { EmptyState, IconButton, LyricsView, Segmented, TrackRow } from './ui-components';
import { AgentPanel, AgentOverlay } from './ui-agent-panel';
export { AgentPanel, AgentOverlay };

export function QueuePanel() {
  const queue = useStore(playerStore, (s) => s.queue);
  const current = useStore(playerStore, (s) => s.track);
  const idx = queue.findIndex((t) => t.id === current?.id);
  const upNext = queue.slice(idx + 1).concat(queue.slice(0, Math.max(0, idx)));

  return (
    <div className="flex flex-col gap-4">
      {current && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-3">Now Playing</div>
          <TrackRow track={current} queue={queue} />
        </div>
      )}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-3">Up Next</div>
        {upNext.length === 0 ? (
          <EmptyState icon={ListMusic} title="Queue is empty" />
        ) : (
          <div className="space-y-1">
            {upNext.map((t) => (
              <div key={t.id} className="relative group">
                <TrackRow track={t} queue={queue} />
                <IconButton
                  icon={X}
                  label="Remove"
                  size="xs"
                  onClick={() => removeFromQueue(t.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SidePanel() {
  const panel = useStore(uiStore, (s) => s.panel);
  if (!panel) return null;

  return (
    <aside className="glass mb-[calc(var(--dock-h)+var(--dock-gap)*2)] mr-3 mt-1 hidden w-[360px] shrink-0 flex-col overflow-hidden rounded-[var(--radius-xl)] lg:flex p-3">
      <div className="flex items-center justify-between gap-2 mb-3">
        <Segmented
          value={panel}
          onChange={(v) => uiStore.set({ panel: v })}
          options={[
            { value: 'agent', label: 'Agent', icon: Sparkles },
            { value: 'queue', label: 'Queue', icon: ListMusic },
            { value: 'lyrics', label: 'Lyrics', icon: MicVocal },
          ]}
        />
        <IconButton icon={X} label="Close" size="sm" onClick={() => togglePanel(panel)} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {panel === 'agent' && <AgentPanel />}
        {panel === 'queue' && <QueuePanel />}
        {panel === 'lyrics' && <LyricsView className="h-full px-2" />}
      </div>
    </aside>
  );
}
