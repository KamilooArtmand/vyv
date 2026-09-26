import { ListMusic, MicVocal, Sparkles, X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { uiStore, togglePanel } from '../../state/ui';
import { Segmented } from '../ui/Controls';
import { IconButton } from '../ui/IconButton';
import { AgentPanel } from './AgentPanel';
import { QueuePanel } from './QueuePanel';
import { LyricsView } from './Lyrics';

/** Right-hand contextual panel on desktop: Agent · Queue · Lyrics. */
export function SidePanel() {
  const panel = useStore(uiStore, (s) => s.panel);
  if (!panel) return null;
  return (
    <aside className="glass anim-rise relative z-20 my-3 mr-3 hidden w-[360px] shrink-0 flex-col overflow-hidden rounded-[var(--radius-xl)] lg:flex" aria-label="Side panel">
      <div className="flex items-center justify-between gap-2 p-3">
        <Segmented
          iconOnly
          value={panel}
          onChange={(v) => uiStore.set({ panel: v })}
          options={[
            { value: 'agent', label: 'Agent', icon: Sparkles },
            { value: 'queue', label: 'Queue', icon: ListMusic },
            { value: 'lyrics', label: 'Lyrics', icon: MicVocal },
          ]}
        />
        <IconButton icon={X} label="Close" size="sm" tip={false} onClick={() => togglePanel(panel)} />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-3 pb-3">
        {panel === 'agent' && <AgentPanel autoFocus />}
        {panel === 'queue' && (
          <div className="scrollbar-none h-full overflow-y-auto">
            <QueuePanel />
          </div>
        )}
        {panel === 'lyrics' && <LyricsView className="h-full px-2" />}
      </div>
    </aside>
  );
}

/** Full-screen agent for phones and narrow windows. */
export function AgentOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] flex flex-col bg-[var(--glass-strong)] backdrop-blur-2xl backdrop-saturate-150 lg:hidden" role="dialog" aria-modal="true" aria-label="Agent">
      <div className="anim-sheet flex h-full flex-col px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))]">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[15px] font-semibold">
            <Sparkles size={16} className="text-accent-ink" /> Agent
          </span>
          <IconButton icon={X} label="Close" variant="soft" size="sm" tip={false} onClick={onClose} />
        </div>
        <div className="min-h-0 flex-1">
          <AgentPanel autoFocus />
        </div>
      </div>
    </div>
  );
}
