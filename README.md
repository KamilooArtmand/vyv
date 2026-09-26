# vyv

A minimal, agent-powered player for music, radio, podcasts and audiobooks.
Icon-only UI, two themes (**Obsidian** dark · **Porcelain** light), rounded everything, and an AI agent that understands moods, years, questions and commands.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # typecheck + production build
npm run preview
```

Installable as a PWA (Chrome / Edge / Safari → *Install app*). Wraps cleanly in Tauri or Electron for desktop builds.

## Design system

| Token | Obsidian | Porcelain |
| --- | --- | --- |
| `--bg` | `#0a0a0c` | `#f6f5f2` |
| `--fg` | `#f5f5f7` | `#0c0c0e` |
| `--surface` / `-2` / `-3` | white @ 4.5 / 8 / 13 % | white 72 % · ink 5 / 9 % |
| `--line` | white @ 7 % | ink @ 7 % |
| `--accent` | adaptive — tinted live from the playing artwork (base `#8b7cff`) | |

- **Radii** 10 · 14 · 20 · 28 · 36 px, pills for every control.
- **Motion** one spring curve (`--ease-spring`) for press, toggles and thumbs; `ease-out` for entrances. Honors OS *reduce motion* and an in-app switch.
- **Theme switch** circular reveal from the tap point (View Transitions API), no-flash boot script, *Auto* follows the OS.
- **Ambient aura** soft blobs tinted by the artwork drift behind the UI while music plays.
- **Generative artwork** every artist, show, book and genre gets a deterministic mesh-gradient cover; images fall back to it on error.
- **Icon-only controls** every button has an accessible name that doubles as a tooltip.
- Brand mark: a converging “V” stroke around a resonant accent dot (`public/icon.svg`).

## Sections

Home · Search · Library & Playlists · Bookmarks (artists, albums, shows, books, stations, wiki…) · Inbox (notifications) · Podcasts · Radio · Audiobooks · Albums · Artists · Genres · Timeline (year by year) · Wiki (music history) · Profile (sound persona, listening DNA) · Settings (switches, EQ faders, output, speed).

Player modes: **Dock** (desktop capsule) / **Mini** (phone), **Cover** (full-screen, synced karaoke lyrics, queue, speed, sleep timer), **Micro** (floating capsule) and **Nano** (orb with progress ring).

## Agent

`src/services/aiAgentService.ts` — an on-device intent engine (English + Persian keywords):

- moods → instant mixes (“something calm”, “focus”, “night drive”), save them as playlists
- years → timeline (“what happened in 1979?”), knowledge → wiki/artist cards (“tell me about jazz”)
- commands: play/pause/next, shuffle/repeat, volume, sleep timer, speed, theme, player modes, like/bookmark
- predictive nudge on Home based on time of day and habits; voice input via the Web Speech API

## Architecture

- React 19 + TypeScript + Vite 6 + Tailwind CSS v4 (tokens in `src/index.css`).
- Tiny external stores (`src/lib/store.ts`, `useSyncExternalStore`) — high-frequency time updates live in their own store so only the scrubber re-renders; the spectrum is drawn on a canvas in its own rAF loop.
- Route-level code splitting, hash deep links (`#/artist/neon`) with browser/OS back support.
- Web Audio graph: 3-band EQ → analyser → output; Media Session API for lock screen, media keys and headsets; `setSinkId` output switching where supported.

## Shortcuts

`Space` play/pause · `←/→` seek 5 s · `Shift+←/→` previous/next · `⌘/Ctrl+K` agent · `F` full screen · `M` mute · `/` search · `Esc` close

## Notes

Catalog, artists, podcasts and user accounts are demo data (`src/data/catalog.ts`); audio uses short royalty-free previews. The *Lossless*, *Normalize*, *Gapless*, *Crossfade*, *Explicit*, *Data saver*, *Offline* and *Downloads* settings are stored preferences that don't change playback yet.
