// ─────────────────────────────────────────────────────────────
// ui-window.tsx: Minimal window controls & resize edges (desktop)
// ─────────────────────────────────────────────────────────────

import { Copy, Minus, Square, X } from 'lucide-react';
import { desktop, useWindowState } from '../core/core-desktop';
import { cn } from '../core/core-utils';

/** Close · minimise · maximise drawn straight on the window body: no chips, no fills. */
export function WindowControls({ className }: { className?: string }) {
  const state = useWindowState();
  if (!desktop) return null;
  const btn = 'no-drag press flex size-8 items-center justify-center text-fg-3 transition-colors hover:text-fg';
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <button type="button" aria-label="Minimize" className={btn} onClick={desktop.minimize}>
        <Minus size={15} strokeWidth={1.5} />
      </button>
      <button type="button" aria-label={state?.maximized ? 'Restore' : 'Maximize'} className={btn} onClick={desktop.toggleMaximize}>
        {state?.maximized ? <Copy size={12.5} strokeWidth={1.5} className="-scale-x-100" /> : <Square size={12} strokeWidth={1.5} />}
      </button>
      <button type="button" aria-label="Close" className={cn(btn, 'hover:!text-[#ff3c00]')} onClick={desktop.close}>
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}

const EDGES: [string, string][] = [
  ['n', 'top-0 inset-x-4 h-1.5 cursor-ns-resize'],
  ['s', 'bottom-0 inset-x-4 h-1.5 cursor-ns-resize'],
  ['w', 'left-0 inset-y-4 w-1.5 cursor-ew-resize'],
  ['e', 'right-0 inset-y-4 w-1.5 cursor-ew-resize'],
  ['nw', 'left-0 top-0 size-4 cursor-nwse-resize'],
  ['ne', 'right-0 top-0 size-4 cursor-nesw-resize'],
  ['sw', 'left-0 bottom-0 size-4 cursor-nesw-resize'],
  ['se', 'right-0 bottom-0 size-4 cursor-nwse-resize'],
];

/** Invisible grab strips along the curved window body. */
export function ResizeEdges({ only }: { only?: string[] }) {
  const state = useWindowState();
  if (!desktop || state?.maximized) return null;
  return (
    <>
      {EDGES.filter(([e]) => !only || only.includes(e)).map(([edge, pos]) => (
        <div
          key={edge}
          aria-hidden
          className={cn('no-drag fixed z-[200]', pos)}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            desktop!.resizeStart(edge);
          }}
          onPointerUp={() => desktop!.resizeEnd()}
          onLostPointerCapture={() => desktop!.resizeEnd()}
        />
      ))}
    </>
  );
}
