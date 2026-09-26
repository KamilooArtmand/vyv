import { Bell, Bookmark, Check, Heart, Moon, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';
import { uiStore } from '../../state/ui';

const ICONS = { heart: Heart, bookmark: Bookmark, check: Check, sparkles: Sparkles, bell: Bell, moon: Moon };

export function Toast() {
  const toast = useStore(uiStore, (s) => s.toast);
  if (!toast) return null;
  const Icon = toast.icon ? ICONS[toast.icon] : Check;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(16px,env(safe-area-inset-top))] z-[80] flex justify-center px-4" role="status" aria-live="polite">
      <div key={toast.id} className="glass-strong anim-pop flex max-w-md items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4 text-[13.5px] font-medium">
        <span className="flex size-6 items-center justify-center rounded-full bg-accent text-on-accent">
          <Icon size={13} strokeWidth={2.2} />
        </span>
        <span className="line-clamp-2">{toast.text}</span>
      </div>
    </div>
  );
}
