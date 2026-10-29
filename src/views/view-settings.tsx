// ─────────────────────────────────────────────────────────────
// view-settings.tsx: Equalizer & App Preferences
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, type ReactNode } from 'react';
import {
  Blend,
  Bot,
  CloudOff,
  Download,
  EyeOff,
  Gauge,
  Globe,
  Cloud,
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
import { useStore } from '../core/core-store';
import { cn } from '../core/core-utils';
import type { ThemePref } from '../core/core-types';
import { libraryStore } from '../state/state-catalog';
import { playerStore, setDevice, setEQ, setSpeed } from '../state/state-player';
import { AuthService, DEFAULT_SETTINGS, EQ_PRESETS, applyTheme, authStore, settingsStore, toast, type Settings as S } from '../state/state-ui';
import { SOURCE_META, sourceReady } from '../services/sources';
import { isConfigured } from '../services/auth';
import { cloudEnabled } from '../services/cloud';
import { onSyncState, type SyncState } from '../services/sync';
import { PROVIDERS } from '../ui/ui-sheets';
import { Chip, Fader, LogoMark, PageHeader, Segmented, Switch, Wordmark } from '../ui/ui-components';

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

const THEME_OPTIONS: Array<{ id: ThemePref; name: string; sub: string; bg: string; surface: string; accent: string }> = [
  { id: 'dark', name: 'Dark', sub: 'Obsidian Black', bg: '#090a0c', surface: '#1b1d22', accent: '#ffffff' },
  { id: 'oled', name: 'Cinema OLED', sub: 'Pure Pitch Black', bg: '#000000', surface: '#0c0c0e', accent: '#ffffff' },
  { id: 'light', name: 'Light', sub: 'Porcelain White', bg: '#f8f9fa', surface: '#e4e7eb', accent: '#0d0f12' },
  { id: 'grey', name: 'Grey', sub: 'Titanium Slate', bg: '#131518', surface: '#23272e', accent: '#94a3b8' },
  { id: 'silver', name: 'Silver', sub: 'Platinum Chrome', bg: '#090b0e', surface: '#19202a', accent: '#e2e8f0' },
  { id: 'golden', name: 'Golden', sub: 'Royal Champagne', bg: '#0c0905', surface: '#241c0e', accent: '#f5cf73' },
  { id: 'bronze', name: 'Bronze', sub: 'Cyber Copper', bg: '#0d0907', surface: '#28170f', accent: '#e07a4a' },
  { id: 'pink', name: 'Pink', sub: 'Neon Rose', bg: '#0d070b', surface: '#270e1e', accent: '#f43f5e' },
  { id: 'red', name: 'Red', sub: 'Velvet Crimson', bg: '#0b0506', surface: '#250b10', accent: '#e11d48' },
  { id: 'auto', name: 'Auto', sub: 'Follow System', bg: '#18191c', surface: '#282a30', accent: '#38bdf8' },
];

export default function SettingsView() {
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
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-surface-3 text-fg-2">
                <Palette size={15} strokeWidth={2} />
              </span>
              <div>
                <div className="text-[14.5px] font-semibold text-fg">Themes & Aesthetics</div>
                <div className="text-[12px] text-fg-3">Choose from 10 handcrafted visual profiles</div>
              </div>
            </div>
            <span className="rounded-full bg-surface-3 px-2.5 py-0.5 text-[11px] font-medium text-fg-2">
              {THEME_OPTIONS.find((t) => t.id === theme)?.name ?? 'Theme'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
            {THEME_OPTIONS.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={(e) => {
                    settingsStore.set({ theme: t.id });
                    applyTheme(t.id, { x: e.clientX, y: e.clientY });
                  }}
                  className={cn(
                    'group relative flex flex-col items-start rounded-xl p-2.5 text-left transition-all duration-200 cursor-pointer outline-none',
                    active
                      ? 'ring-2 ring-accent shadow-md bg-surface-2'
                      : 'bg-surface hover:bg-surface-2 hover:scale-[1.02]'
                  )}
                >
                  <div
                    className="relative mb-2 flex h-8 w-full items-center justify-between rounded-lg border border-white/10 px-2 shadow-inner"
                    style={{ background: t.bg }}
                  >
                    <div className="size-3.5 rounded-full border border-white/20" style={{ background: t.surface }} />
                    <div className="size-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.35)]" style={{ background: t.accent }} />
                  </div>

                  <div className="flex w-full items-center justify-between">
                    <span className={cn('text-[13px] font-semibold tracking-tight', active ? 'text-fg' : 'text-fg-2')}>
                      {t.name}
                    </span>
                    {active && (
                      <span className="flex size-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-on-accent">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="truncate max-w-full text-[11px] text-fg-3">{t.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
        <Toggle k="adaptiveColor" icon={Blend} label="Adaptive color" hint="Tint from artwork" />
        <Toggle k="aura" icon={Wind} label="Ambient aura" />
        <Toggle k="reduceMotion" icon={Rabbit} label="Reduce motion" />
      </Group>

      <AccountsGroup />
      <SourcesGroup />

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
          <LogoMark bare className="size-7" />
          <Wordmark />
        </div>
        <span className="flex items-center gap-1.5 text-[12px]">
          <Zap size={12} /> 2.0 · <Bot size={12} /> Agent on-device
        </span>
      </footer>
    </div>
  );
}

/** vyv accounts are Google or Facebook identities — nothing else, no passwords. */
function useSyncState() {
  const [state, setState] = useState<SyncState>('off');
  useEffect(() => onSyncState(setState), []);
  return state;
}

function AccountsGroup() {
  const user = useStore(authStore, (s) => s.user);
  const busy = useStore(authStore, (s) => s.busy);
  const sync = useSyncState();
  const syncHint = !cloudEnabled
    ? 'This device only — add Supabase to sync across devices'
    : !user
      ? 'Sign in to sync your library'
      : { off: 'Off', syncing: 'Syncing…', synced: 'Library synced to your account', error: 'Sync paused — will retry' }[sync];
  return (
    <Group title="Account">
      <Row icon={Cloud} label="Cloud sync" hint={syncHint}>
        <span className={cn('size-2 rounded-full', cloudEnabled && user && sync === 'synced' ? 'bg-[#10b981]' : sync === 'error' ? 'bg-[#ff3c00]' : 'bg-fg-3')} />
      </Row>
      {PROVIDERS.map(({ id, label, glyph: Glyph }) => {
        const acc = user?.accounts.find((a) => a.provider === id);
        return (
          <div key={id} className="flex min-h-[60px] items-center gap-3.5 px-4 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Glyph className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px]">{label}</div>
              <div className="truncate text-[12.5px] text-fg-3">{acc ? acc.email || acc.name : isConfigured(id) ? 'Not connected' : 'Add the app id to .env to enable'}</div>
            </div>
            {acc ? (
              <button type="button" onClick={() => AuthService.disconnect(id)} className="press rounded-full px-3 py-1.5 text-[13px] font-semibold text-fg-3 hover:text-fg">
                Disconnect
              </button>
            ) : (
              <button type="button" disabled={!!busy} onClick={() => AuthService.continueWith(id)} className="press rounded-full bg-surface-2 px-3.5 py-1.5 text-[13px] font-semibold hover:bg-surface-3 disabled:opacity-50">
                {user ? 'Connect' : 'Sign in'}
              </button>
            )}
          </div>
        );
      })}
    </Group>
  );
}

function SourcesGroup() {
  return (
    <Group title="Sources">
      {(Object.keys(SOURCE_META) as (keyof typeof SOURCE_META)[]).map((id) => {
        const m = SOURCE_META[id];
        const ready = sourceReady(id);
        return (
          <Row key={id} icon={Globe} label={m.name} hint={ready ? m.what : `Needs ${m.needsKey}`}>
            <span className={cn('flex items-center gap-1.5 text-[12.5px] font-medium', ready ? 'text-fg-2' : 'text-fg-3')}>
              <span className={cn('size-1.5 rounded-full', ready ? 'bg-[#10b981]' : 'bg-fg-3')} />
              {ready ? 'Live' : 'Off'}
            </span>
          </Row>
        );
      })}
    </Group>
  );
}
