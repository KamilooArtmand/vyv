// ─────────────────────────────────────────────────────────────
// App.tsx: Clean Architecture Shell & Router
// ─────────────────────────────────────────────────────────────

import { Suspense, lazy, useCallback, useEffect, useState, type ComponentType } from 'react';
import { useStore } from './core/core-store';
import { useMediaQuery } from './core/core-utils';
import { bootPlayer, next, prev, skip, toggleMute, togglePlay } from './state/state-player';
import { applyTheme, navigate, settingsStore, setMode, togglePanel, uiStore } from './state/state-ui';
import { Aura, BottomNav, MiniPlayer, PlayerDock, Sidebar, Toast, TopBar } from './ui/ui-shell';
import { CoverPlayer, MicroPlayer, NanoPlayer } from './ui/ui-modes';
import { AgentOverlay, SidePanel } from './ui/ui-panels';
import { Sheets } from './ui/ui-sheets';
import { ResizeEdges } from './ui/ui-window';
import { UpdateBanner } from './ui/ui-update';
import { desktop } from './core/core-desktop';
import { loadSnapshot } from './services/snapshot';
import { startSync } from './services/sync';
import type { RouteName } from './core/core-types';

const named = <K extends string>(p: Promise<Record<K, ComponentType<{ id?: string }>>>, k: K) =>
  p.then((m) => ({ default: m[k] }));

const VIEWS: Record<RouteName, ComponentType<{ id?: string }>> = {
  home: lazy(() => import('./views/view-home')),
  search: lazy(() => import('./views/view-search')),
  library: lazy(() => named(import('./views/view-media'), 'LibraryView')),
  playlist: lazy(() => named(import('./views/view-media'), 'PlaylistView')),
  video: lazy(() => import('./views/view-video')),
  discover: lazy(() => import('./views/view-discover')),
  bookmarks: lazy(() => named(import('./views/view-extra'), 'BookmarksView')),
  notifications: lazy(() => named(import('./views/view-extra'), 'NotificationsView')),
  podcasts: lazy(() => named(import('./views/view-media'), 'PodcastsView')),
  show: lazy(() => named(import('./views/view-media'), 'ShowView')),
  radio: lazy(() => named(import('./views/view-media'), 'RadioView')),
  audiobooks: lazy(() => named(import('./views/view-media'), 'AudiobooksView')),
  book: lazy(() => named(import('./views/view-media'), 'BookView')),
  albums: lazy(() => named(import('./views/view-catalog'), 'Albums')),
  album: lazy(() => named(import('./views/view-catalog'), 'AlbumView')),
  artists: lazy(() => named(import('./views/view-catalog'), 'Artists')),
  artist: lazy(() => named(import('./views/view-catalog'), 'ArtistView')),
  genres: lazy(() => named(import('./views/view-catalog'), 'Genres')),
  genre: lazy(() => named(import('./views/view-catalog'), 'GenreView')),
  timeline: lazy(() => named(import('./views/view-extra'), 'TimelineView')),
  wiki: lazy(() => named(import('./views/view-extra'), 'WikiView')),
  article: lazy(() => named(import('./views/view-extra'), 'ArticleView')),
  profile: lazy(() => named(import('./views/view-media'), 'ProfileView')),
  settings: lazy(() => import('./views/view-settings')),
};

export function App() {
  const route = useStore(uiStore, (s) => s.route);
  const mode = useStore(uiStore, (s) => s.mode);
  const themePref = useStore(settingsStore, (s) => s.theme);
  const wide = useMediaQuery('(min-width: 1024px)');
  const [agentOpen, setAgentOpen] = useState(false);

  const openAgent = useCallback(() => (wide ? togglePanel('agent') : setAgentOpen((o) => !o)), [wide]);

  useEffect(() => {
    bootPlayer();
    loadSnapshot(); // warm the bundled catalogue so fallbacks are instant
  }, []);
  useEffect(() => startSync(), []);

  // Desktop: every player mode is a real OS window shape (square, pill, orb).
  useEffect(() => {
    desktop?.setMode(mode);
  }, [mode]);
  useEffect(() => desktop?.onSetMode(setMode), []);

  useEffect(() => {
    applyTheme(themePref);
  }, [themePref]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        return openAgent();
      }
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey) next();
          else skip(5);
          break;
        case 'ArrowLeft':
          if (e.shiftKey) prev();
          else skip(-5);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          setMode(uiStore.get().mode === 'Cover' ? 'Full' : 'Cover');
          break;
        case '/':
          e.preventDefault();
          navigate({ name: 'search' });
          break;
        case 'Escape':
          if (uiStore.get().mode !== 'Full') setMode('Full');
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openAgent]);

  if (mode === 'Cover') return <CoverPlayer />;
  if (mode === 'Micro') return <MicroPlayer />;
  if (mode === 'Nano') return <NanoPlayer />;

  const ViewComponent = VIEWS[route.name] || VIEWS.home;

  return (
    <div className="app-frame relative isolate flex h-dvh w-full flex-col overflow-hidden font-sans text-fg antialiased select-none">
      <Aura />
      <ResizeEdges />
      <TopBar onAgent={openAgent} />

      <div className="flex min-h-0 flex-1">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <main id="main-scroll" className="scrollbar-none min-w-0 flex-1 overflow-y-auto px-4 pb-40 pt-2 md:px-8 md:pb-[calc(var(--dock-h)+var(--dock-gap)*2+24px)]">
          <Suspense fallback={<div className="p-8 text-center text-fg-3">Loading…</div>}>
            <ViewComponent id={route.id} />
          </Suspense>
        </main>
        <SidePanel />
      </div>

      <AgentOverlay open={agentOpen} onClose={() => setAgentOpen(false)} />
      <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
        <MiniPlayer />
        <BottomNav onAgent={openAgent} />
      </div>

      <div className="pointer-events-none absolute inset-x-[var(--dock-gap)] bottom-[var(--dock-gap)] z-30 hidden md:block">
        <PlayerDock />
      </div>

      <Sheets />
      <Toast />
      <UpdateBanner />
    </div>
  );
}
