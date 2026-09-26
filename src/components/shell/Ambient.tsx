import { useStore } from '../../lib/store';
import { settingsStore } from '../../state/settings';
import { playerStore } from '../../state/player';

/** Living background: soft blobs tinted by the current artwork. */
export function Aura() {
  const on = useStore(settingsStore, (s) => s.aura);
  const playing = useStore(playerStore, (s) => s.isPlaying);
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ opacity: 'var(--aura-opacity)' }}>
      <div
        className="anim-drift absolute -left-[10%] -top-[20%] size-[60vmax] rounded-full blur-[110px] transition-[background] duration-[1500ms]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 65%)', animationPlayState: playing ? 'running' : 'paused' }}
      />
      <div
        className="anim-drift absolute -bottom-[25%] -right-[15%] size-[55vmax] rounded-full blur-[120px] transition-[background] duration-[1500ms] [animation-delay:-8s] [animation-duration:32s]"
        style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--accent) 45%, var(--gray)) 0%, transparent 65%)', opacity: 0.6, animationPlayState: playing ? 'running' : 'paused' }}
      />
    </div>
  );
}
