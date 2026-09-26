import { Suspense, lazy, useCallback, useEffect, useState, type ComponentType } from 'react';
import { useStore } from './lib/store';
import { useMediaQuery } from './lib/hooks';
import { bootPlayer, next, prev, skip, toggleMute, togglePlay } from './state/player';
import { applyTheme, settingsStore } from './state/settings';
import { pushNotification } from './state/library';
import { navigate, setMode, toast, togglePanel, uiStore } from './state/ui';
import { Sidebar } from './components/shell/Sidebar';
import { TopBar } from './components/shell/TopBar';
import { BottomNav } from './components/shell/BottomNav';
import { MiniPlayer, PlayerDock } from './components/shell/PlayerDock';
import { AgentOverlay, SidePanel } from './components/shell/SidePanel';
import { Sheets } from './components/shell/Sheets';
import { Toast } from './components/shell/Toast';
import { Aura } from './components/shell/Ambient';
import { CoverPlayer } from './components/modes/CoverPlayer';
import { MicroPlayer, NanoPlayer } from './components/modes/MiniModes';
import type { RouteName } from './types';

// Route-level code splitting keeps first paint light.
const named = <K extends string>(p: Promise<Record<K, ComponentType<{ id?: string }>>>, k: K) => p.then((m) => ({ default: m[k] }));
const catalog = () => import('./views/Catalog');
const VIEWS: Record<RouteName, ComponentType<{ id?: string }>> = {
  home: lazy(() => import('./views/Home')),
  search: lazy(() => import('./views/Search')),
  library: lazy(() => import('./views/Library')),
  playlist: lazy(() => named(import('./views/Library'), 'PlaylistView')),
  bookmarks: lazy(() => import('./views/Bookmarks')),
  notifications: lazy(() => import('./views/Notifications')),
  podcasts: lazy(() => import('./views/Podcasts')),
  show: lazy(() => named(import('./views/Podcasts'), 'ShowView')),
  radio: lazy(() => import('./views/Radio')),
  audiobooks: lazy(() => import('./views/Audiobooks')),
  book: lazy(() => named(import('./views/Audiobooks'), 'BookView')),
  albums: lazy(() => named(catalog(), 'Albums')),
  album: lazy(() => named(catalog(), 'AlbumView')),
  artists: lazy(() => named(catalog(), 'Artists')),
  artist: lazy(() => named(catalog(), 'ArtistView')),
  genres: lazy(() => named(catalog(), 'Genres')),
  genre: lazy(() => named(catalog(), 'GenreView')),
  timeline: lazy(() => import('./views/Timeline')),
  wiki: lazy(() => import('./views/Wiki')),
  article: lazy(() => named(import('./views/Wiki'), 'ArticleView')),
  profile: lazy(() => import('./views/Profile')),
  settings: lazy(() => import('./views/Settings')),
};

function ViewSkeleton() {
  return (
    <div className="flex flex-col gap-6 pt-2" aria-hidden>
      <div className="skeleton h-12 w-64 rounded-[var(--radius-md)]" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton aspect-square rounded-[18px]" />
        ))}
      </div>
    </div>
  );
}

const isField = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export function App() {
  const route = useStore(uiStore, (s) => s.route);
  const mode = useStore(uiStore, (s) => s.mode);
  const reduceMotion = useStore(settingsStore, (s) => s.reduceMotion);
  const themePref = useStore(settingsStore, (s) => s.theme);
  const wide = useMediaQuery('(min-width: 1024px)');
  const tablet = useMediaQuery('(min-width: 768px)');
  const [agentOpen, setAgentOpen] = useState(false);

  const openAgent = useCallback(() => (wide ? togglePanel('agent') : setAgentOpen((o) => !o)), [wide]);

  useEffect(() => {
    bootPlayer();
    // A live notification arrives a little after launch.
    const t = setTimeout(() => {
      if (!settingsStore.get().notifications) return;
      pushNotification({ type: 'podcast', title: 'Mind the Beat · Ep. 12', content: 'Why sad songs feel good — out now.', route: { name: 'show', id: 'mind' } });
      toast('New episode: Why sad songs feel good', 'bell');
    }, 25_000);
    return () => clearTimeout(t);
  }, []);

  // Theme: apply now, and follow the OS while on “auto”.
  useEffect(() => {
    applyTheme(themePref);
    if (themePref !== 'auto') return;
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const on = () => applyTheme('auto');
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, [themePref]);

  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? 'reduced' : 'full';
  }, [reduceMotion]);

  // Keyboard: Space, ⌘K, M, F, Shift+←/→, ←/→, /, Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        return openAgent();
      }
      if (isField(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const { mode: m, route: r } = uiStore.get();
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey) next();
          else if (r.name !== 'timeline') skip(5);
          break;
        case 'ArrowLeft':
          if (e.shiftKey) prev();
          else if (r.name !== 'timeline') skip(-5);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          setMode(m === 'Cover' ? 'Full' : 'Cover');
          break;
        case '/':
          e.preventDefault();
          navigate({ name: 'search' });
          break;
        case 'Escape':
          if (m !== 'Full' && !uiStore.get().sheet) setMode('Full');
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openAgent]);

  const View = VIEWS[route.name];
  const compactMode = mode === 'Micro' || mode === 'Nano';

  return (
    <>
      <Aura />
      {!compactMode && (
        <div className="flex h-dvh w-full overflow-hidden">
          {tablet && <Sidebar />}
          <div className="relative flex min-w-0 flex-1 flex-col">
            <main
              id="main-scroll"
              className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-[calc(var(--nav-h)+100px+env(safe-area-inset-bottom))] md:px-8 md:pb-[calc(var(--dock-h)+48px)]"
            >
              <TopBar onAgent={openAgent} />
              <div className="mx-auto w-full max-w-[1400px] pt-2">
                <Suspense fallback={<ViewSkeleton />}>
                  <View key={`${route.name}-${route.id ?? ''}`} id={route.id} />
                </Suspense>
              </div>
            </main>

            {mode !== 'Cover' &&
              (tablet ? (
                <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30">
                  <PlayerDock />
                </div>
              ) : (
                <div className="fixed inset-x-2 bottom-[max(8px,env(safe-area-inset-bottom))] z-30 flex flex-col gap-2">
                  <MiniPlayer />
                  <BottomNav onAgent={openAgent} />
                </div>
              ))}
          </div>
          {wide && <SidePanel />}
        </div>
      )}

      {mode === 'Cover' && <CoverPlayer />}
      {mode === 'Micro' && <MicroPlayer />}
      {mode === 'Nano' && <NanoPlayer />}

      <AgentOverlay open={agentOpen && !wide} onClose={() => setAgentOpen(false)} />
      <Sheets />
      <Toast />
    </>
  );
}
