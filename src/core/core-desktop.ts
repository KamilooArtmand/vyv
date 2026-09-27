// ─────────────────────────────────────────────────────────────
// core-desktop.ts: Bridge to the Electron shell (absent on the web)
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import type { PlayerMode } from './core-types';

export interface DesktopWindowState {
  maximized: boolean;
  mode: PlayerMode;
  platform: string;
}

export interface DesktopBridge {
  platform: string;
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  setMode: (mode: PlayerMode) => void;
  showModeMenu: (current: PlayerMode) => void;
  resizeStart: (edge: string) => void;
  resizeEnd: () => void;
  getState: () => Promise<DesktopWindowState>;
  onState: (cb: (s: DesktopWindowState) => void) => () => void;
  onSetMode: (cb: (m: PlayerMode) => void) => () => void;
  oauth: (provider: 'google' | 'facebook', clientId: string, scope: string) => Promise<{ accessToken: string; expiresIn?: number }>;
  openExternal: (url: string) => void;
}

export const desktop: DesktopBridge | undefined =
  typeof window !== 'undefined' ? (window as unknown as { vyvDesktop?: DesktopBridge }).vyvDesktop : undefined;

export const isDesktop = !!desktop;

// Let CSS know it is drawing its own window body.
if (isDesktop && typeof document !== 'undefined') document.documentElement.dataset.shell = 'desktop';

export function useWindowState(): DesktopWindowState | null {
  const [state, setState] = useState<DesktopWindowState | null>(null);
  useEffect(() => {
    if (!desktop) return;
    desktop.getState().then(setState);
    return desktop.onState(setState);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.maximized = state?.maximized ? 'true' : 'false';
  }, [state?.maximized]);
  return state;
}

export function openExternal(url: string) {
  if (desktop) desktop.openExternal(url);
  else window.open(url, '_blank', 'noopener');
}
