import { ListMusic, X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { playerStore, removeFromQueue } from '../../state/player';
import { TrackRow } from '../ui/Cards';
import { EmptyState } from '../ui/Layout';
import { IconButton } from '../ui/IconButton';

export function QueuePanel() {
  const queue = useStore(playerStore, (s) => s.queue);
  const current = useStore(playerStore, (s) => s.track);
  const idx = queue.findIndex((t) => t.id === current?.id);
  const upNext = queue.slice(idx + 1).concat(queue.slice(0, Math.max(0, idx)));

  return (
    <div className="flex flex-col gap-5">
      {current && (
        <div>
          <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">Now</div>
          <TrackRow track={current} queue={queue} />
        </div>
      )}
      <div>
        <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">Next</div>
        {upNext.length === 0 ? (
          <EmptyState icon={ListMusic} title="Queue is empty" />
        ) : (
          <div className="flex flex-col">
            {upNext.map((t) => (
              <div key={t.id} className="group/q relative">
                <TrackRow track={t} queue={queue} />
                <IconButton
                  icon={X}
                  label="Remove"
                  size="xs"
                  tip={false}
                  onClick={() => removeFromQueue(t.id)}
                  className="absolute right-11 top-1/2 -translate-y-1/2 opacity-0 group-hover/q:opacity-100"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
