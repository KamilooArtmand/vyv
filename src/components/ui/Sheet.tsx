import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/format';
import { IconButton } from './IconButton';

/** Bottom sheet on phones, centered dialog on larger screens. */
export function Sheet({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="anim-fade absolute inset-0 bg-black/40 backdrop-blur-[6px]" onClick={onClose} />
      <div
        className={cn(
          'glass-strong anim-sheet relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[var(--radius-2xl)] p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:anim-pop sm:max-w-md sm:rounded-[var(--radius-2xl)] sm:p-6',
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-surface-3 sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0 text-[17px] font-semibold tracking-[-0.02em]">{title}</div>
          <IconButton icon={X} label="Close" size="sm" variant="soft" tip={false} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

export function SheetItem({ icon: Icon, children, onClick, active, danger }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; children: ReactNode; onClick: () => void; active?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'press flex h-12 w-full items-center gap-3.5 rounded-[var(--radius-md)] px-3 text-left text-[15px] hover:bg-surface-2',
        active && 'text-accent-ink',
        danger && 'text-live',
      )}
    >
      <Icon size={19} strokeWidth={1.75} className={cn(!active && !danger && 'text-fg-2', active && 'fill-current')} />
      <span className="truncate">{children}</span>
    </button>
  );
}
