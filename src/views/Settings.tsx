import type { ReactNode } from 'react';
import {
  Blend,
  Bot,
  CloudOff,
  Download,
  EyeOff,
  Gauge,
  Infinity as InfinityIcon,
  Mic,
  MicVocal,
  Moon,
  Palette,
  RotateCcw,
  Shield,
  Signal,
  Sparkles,
  Speaker,
  Sun,
  SunMoon,
  Trash2,
  Waves,
  Wind,
  Zap,
  Bell,
  AudioLines,
  Rabbit,
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/format';
import { DEFAULT_SETTINGS, EQ_PRESETS, applyTheme, settingsStore, type Settings as S } from '../state/settings';
import { libraryStore } from '../state/library';
import { playerStore, setDevice, setEQ, setSpeed } from '../state/player';
import { toast } from '../state/ui';
import { Chip, Fader, Segmented, Switch } from '../components/ui/Controls';
import { PageHeader } from '../components/ui/Layout';
import { LogoMark, Wordmark } from '../components/ui/Logo';
import type { ThemePref } from '../types';

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="anim-rise mb-7">
      <h2 className="mb-2 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-3">{title}</h2>
      <div className="card divide-y divide-line overflow-hidden rounded-[var(--radius-xl)]">{children}</div>
    </section>
  );
}

// Icons stay a single neutral gray chip — the only color on this page is
// the accent showing through an active switch, segment or the EQ fill.
function Row({ icon: Icon, label, hint, children }: { icon: LucideIcon; label: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-[60px] items-center gap-3.5 px-4 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-surface-3 text-fg-2">
        <Icon size={16} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px]">{label}</div>
        {hint && <div className="truncate text-[12.5px] text-fg-3">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ k, icon, label, hint }: { k: keyof S; icon: LucideIcon; label: string; hint?: string }) {
  const v = useStore(settingsStore, (s) => s[k] as boolean);
  return (
    <Row icon={icon} label={label} hint={hint}>
      <Switch checked={v} label={label} onChange={(n) => settingsStore.set({ [k]: n } as Partial<S>)} />
    </Row>
  );
}

export default function Settings() {
  const theme = useStore(settingsStore, (s) => s.theme);
  const eq = useStore(settingsStore, (s) => s.eq);
  const preset = useStore(settingsStore, (s) => s.eqPreset);
  const speed = useStore(settingsStore, (s) => s.speed);
  const deviceId = useStore(settingsStore, (s) => s.deviceId);
  const devices = useStore(playerStore, (s) => s.devices);

  const setBand = (i: number, v: number) => {
    const next = [...eq] as [number, number, number];
    next[i] = v;
    setEQ(next);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" />

      <Group title="Look">
        <Row icon={Palette} label="Theme">
          <Segmented<ThemePref>
            iconOnly
            size="sm"
            value={theme}
            onChange={(t, e) => {
              settingsStore.set({ theme: t });
              applyTheme(t, { x: e.clientX, y: e.clientY });
            }}
            options={[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'auto', label: 'Auto', icon: SunMoon },
            ]}
          />
        </Row>
        <Toggle k="adaptiveColor" icon={Blend} label="Adaptive color" hint="Tint from artwork" />
        <Toggle k="aura" icon={Wind} label="Ambient aura" />
        <Toggle k="reduceMotion" icon={Rabbit} label="Reduce motion" />
      </Group>

      <Group title="Sound">
        <div className="px-4 py-4">
          <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {EQ_PRESETS.map((p) => (
              <Chip key={p.id} active={preset === p.id} onClick={() => setEQ(p.gains, p.id)}>
                {p.label}
              </Chip>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {(['Bass', 'Mid', 'Treble'] as const).map((band, i) => (
              <div key={band} className="flex flex-col items-center gap-2">
                <span className={cn('text-[12px] font-semibold tabular', eq[i] ? 'text-accent-ink' : 'text-fg-3')}>
                  {eq[i] > 0 ? '+' : ''}
                  {eq[i]}
                </span>
                <div className="h-32 py-2.5">
                  <Fader label={band} value={eq[i]} min={-12} max={12} onChange={(v) => setBand(i, v)} />
                </div>
                <span className="text-[12px] text-fg-3">{band}</span>
              </div>
            ))}
          </div>
        </div>
        <Row icon={Speaker} label="Output">
          <select
            value={deviceId}
            onChange={(e) => setDevice(e.target.value)}
            aria-label="Output device"
            className="max-w-[46%] truncate rounded-full bg-surface-2 px-3 py-1.5 text-[13px] outline-none"
          >
            {(devices.length ? devices : [{ id: 'default', name: 'System' }]).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Row>
        <Row icon={Gauge} label="Speed">
          <Segmented
            size="sm"
            value={String(speed)}
            onChange={(v) => setSpeed(Number(v))}
            options={['0.75', '1', '1.25', '1.5', '2'].map((v) => ({ value: v, label: `${v}×` }))}
          />
        </Row>
      </Group>

      <Group title="Playback">
        <Toggle k="hiRes" icon={AudioLines} label="Lossless" />
        <Toggle k="normalize" icon={Waves} label="Normalize volume" />
        <Toggle k="gapless" icon={InfinityIcon} label="Gapless" />
        <Toggle k="crossfade" icon={Blend} label="Crossfade" />
        <Toggle k="lyrics" icon={MicVocal} label="Lyrics" />
        <Toggle k="explicit" icon={Shield} label="Explicit content" />
      </Group>

      <Group title="Agent">
        <Toggle k="agentProactive" icon={Sparkles} label="Predictions" hint="Suggest music for the moment" />
        <Toggle k="agentVoice" icon={Mic} label="Voice" />
        <Toggle k="privateSession" icon={EyeOff} label="Private session" hint="Don’t learn from this" />
      </Group>

      <Group title="Data">
        <Toggle k="notifications" icon={Bell} label="Notifications" />
        <Toggle k="dataSaver" icon={Signal} label="Data saver" />
        <Toggle k="offline" icon={CloudOff} label="Offline mode" />
        <Row icon={Download} label="Downloads" hint="0 tracks · 0 MB" />
      </Group>

      <Group title="Reset">
        <button type="button" onClick={() => (libraryStore.set({ history: [] }), toast('History cleared', 'check'))} className="press flex h-[56px] w-full items-center gap-3.5 px-4 text-left text-[15px] hover:bg-surface-2">
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-surface-3">
            <Trash2 size={16} />
          </span>
          Clear history
        </button>
        <button
          type="button"
          onClick={() => {
            settingsStore.set(DEFAULT_SETTINGS);
            setEQ(DEFAULT_SETTINGS.eq, 'flat');
            setSpeed(1);
            applyTheme(DEFAULT_SETTINGS.theme);
            toast('Settings reset', 'check');
          }}
          className="press flex h-[56px] w-full items-center gap-3.5 px-4 text-left text-[15px] text-live hover:bg-surface-2"
        >
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-live/15">
            <RotateCcw size={16} />
          </span>
          Reset settings
        </button>
      </Group>

      <footer className="flex flex-col items-center gap-2 py-8 text-fg-3">
        <div className="flex items-center gap-2 text-fg">
          <LogoMark className="size-7" />
          <Wordmark />
        </div>
        <span className="flex items-center gap-1.5 text-[12px]">
          <Zap size={12} /> 2.0 · <Bot size={12} /> Agent on-device
        </span>
      </footer>
    </div>
  );
}
