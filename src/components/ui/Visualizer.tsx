import { useEffect, useRef } from 'react';
import { AudioService } from '../../services/audioService';

/** Canvas spectrum drawn in its own rAF loop — zero React re-renders.
 *  Pauses itself when off-screen or when nothing is playing. */
export function Visualizer({ bars = 24, className, mirror, color = 'var(--accent)' }: { bars?: number; className?: string; mirror?: boolean; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = new Float32Array(bars);
    const smooth = new Float32Array(bars);
    let raf = 0;
    let visible = true;
    let fill = '';
    let frame = 0;
    let idle = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      fill = getComputedStyle(canvas).color;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      if (++frame % 30 === 0) fill = getComputedStyle(canvas).color;
      // Once settled while paused, stop repainting until playback resumes.
      if (!AudioService.isPlaying && ++idle > 40) return;
      if (AudioService.isPlaying) idle = 0;
      AudioService.fillSpectrum(data);
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fill;
      const gap = w / bars;
      const bw = Math.max(2, gap * 0.42);
      for (let i = 0; i < bars; i++) {
        smooth[i] += (data[i] - smooth[i]) * 0.25;
        const v = Math.max(0.04, smooth[i]);
        const bh = mirror ? v * h * 0.9 : v * h;
        const x = i * gap + (gap - bw) / 2;
        const y = mirror ? (h - bh) / 2 : h - bh;
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, bw / 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [bars, mirror]);

  return <canvas ref={ref} className={className} style={{ color }} aria-hidden />;
}

/** Tiny CSS equalizer used in rows and badges. */
export function EqBars({ playing, className }: { playing: boolean; className?: string }) {
  return (
    <span className={`eq-bars inline-flex h-3.5 items-end gap-[2px] ${playing ? '' : 'paused'} ${className ?? ''}`} aria-hidden>
      <span className="h-full" />
      <span className="h-full" />
      <span className="h-full" />
    </span>
  );
}
