// ─────────────────────────────────────────────────────────────
// view-settings.tsx: Equalizer, Firebase Sync & App Preferences
// ─────────────────────────────────────────────────────────────

import { Cloud, Database, Sparkles } from 'lucide-react';
import { useStore } from '../core/core-store';
import { initOnlineCatalog, onlineCatalogStore } from '../state/state-catalog';
import { playerStore, setDevice, setEQ, setSpeed } from '../state/state-player';
import { EQ_PRESETS, applyTheme, settingsStore, toast, type Settings } from '../state/state-ui';
import { Chip, PageHeader, Segmented, Switch } from '../ui/ui-components';

export default function SettingsView() {
  const theme = useStore(settingsStore, (s) => s.theme);
  const eq = useStore(settingsStore, (s) => s.eq);
  const preset = useStore(settingsStore, (s) => s.eqPreset);
  const speed = useStore(settingsStore, (s) => s.speed);
  const onlineCatalog = useStore(onlineCatalogStore, (s) => s);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" />

      {/* Cloud & Firebase Sync */}
      <section className="mb-7">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-3">Cloud Database</h2>
        <div className="glass rounded-[var(--radius-xl)] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface-2">
              {onlineCatalog.onlineConnected ? <Cloud size={20} className="text-fg" /> : <Database size={20} className="text-fg-3" />}
            </span>
            <div>
              <div className="font-semibold text-sm">Firebase Firestore</div>
              <div className="text-xs text-fg-3">
                {onlineCatalog.onlineConnected
                  ? `Connected · ${onlineCatalog.tracks.length} tracks, ${onlineCatalog.artists.length} artists`
                  : 'Offline cached catalog'}
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={onlineCatalog.loading}
            onClick={async () => {
              toast('Syncing with online database…', 'sparkles');
              await initOnlineCatalog();
              toast('Database synced successfully', 'check');
            }}
            className="press rounded-full bg-surface-2 px-3.5 py-1.5 text-xs font-semibold hover:bg-surface-3"
          >
            {onlineCatalog.loading ? 'Syncing…' : 'Sync now'}
          </button>
        </div>
      </section>

      {/* Sound & Equalizer */}
      <section className="mb-7">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-3">Equalizer & Audio</h2>
        <div className="glass rounded-[var(--radius-xl)] p-5">
          <div className="flex gap-2 overflow-x-auto pb-4">
            {EQ_PRESETS.map((p) => (
              <Chip key={p.id} active={preset === p.id} onClick={() => setEQ(p.gains, p.id)}>
                {p.label}
              </Chip>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line-2 pt-4">
            <span className="text-sm font-medium">Playback Speed</span>
            <Segmented
              value={String(speed)}
              onChange={(v) => setSpeed(Number(v))}
              options={['0.75', '1', '1.25', '1.5', '2'].map((v) => ({ value: v, label: `${v}×` }))}
            />
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="mb-7">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-3">Appearance</h2>
        <div className="glass rounded-[var(--radius-xl)] p-4 flex items-center justify-between">
          <span className="text-sm font-medium">Theme</span>
          <Segmented
            value={theme}
            onChange={(v) => {
              settingsStore.set({ theme: v });
              applyTheme(v);
            }}
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
