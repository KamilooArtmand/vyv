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

Installable as a PWA (Chrome / Edge / Safari → *Install app*).

### Desktop (Windows · macOS · Linux)

```bash
npm run desktop       # build, then open the frameless desktop app
npm run desktop:dev   # with `npm run dev` running: live-reload inside the desktop shell
npm run dist:win      # NSIS installer + MSIX (Microsoft Store) in release/
```

The desktop shell (`electron/`) is a frameless, transparent window: the app draws its own curved body (`--win-r`) and minimal close / minimise / maximise glyphs straight on the header — no title bar, no button fills. The header is the drag handle (double-click maximises) and the edges resize. Player modes reshape the real OS window: **Cover** becomes a square, **Micro** a floating pill and **Nano** a floating orb, both always on top; right-click the vyv mark for a native mode menu. Add a 256 px+ icon to `build.win.icon` before shipping installers.

## Accounts

There are no usernames or passwords. The account **is** the user's Google (Gmail) or Facebook identity; either can be linked to the same profile later (Settings → Account, or Profile).

- **Web** — Google Identity Services token client and the Facebook JS SDK (popup).
- **Desktop** — Google opens in the system browser with a loopback redirect + PKCE (RFC 8252, required by Google for installed apps); Facebook uses its manual login dialog.
- Tokens are used once to read name, email and photo, and are never stored. Configure the client ids in `.env` (see `.env.example`); without them the buttons explain what to set.

## Live sources

Real services, real playback — results map onto the app's own `Track` type, so play, queue, like, bookmark, playlists and history all work on them, and saved items survive reloads (`remoteStore`).

| Source | What | Key |
| --- | --- | --- |
| Radio Browser | ~50k live stations; Kurdish (Sorani / Kurmanji) first on Radio and Home | none |
| Audius | Full-length tracks from independent artists; search + weekly trending | none |
| Apple Podcasts directory | Any podcast: search, show pages, real episode audio, resume | none |
| Internet Archive | Heritage recordings, LibriVox audiobooks, public-domain films | none |
| YouTube | Video search + official embedded player | `VITE_YOUTUBE_API_KEY` |

Hosts that send no CORS headers (most radio streams and podcast CDNs) play through a second audio element outside the Web Audio graph, so they never go silent; CORS-enabled sources (Audius, Archive) keep the EQ and visualiser. `src/services/sources.ts` is the single integration point.

## Design system

| Token | Obsidian | Porcelain |
| --- | --- | --- |
| `--bg` | `#0a0a0c` | `#f6f5f2` |
| `--fg` | `#f5f5f7` | `#0c0c0e` |
| `--surface` / `-2` / `-3` | white @ 4.5 / 8 / 13 % | white 72 % · ink 5 / 9 % |
| `--line` | white @ 7 % | ink @ 7 % |
| `--accent` | adaptive — tinted live from the playing artwork (base `#8b7cff`) | |

- **Radii** 10 · 14 · 20 · 28 · 36 px, pills for every control. Window body `--win-r` 44 px; the dock is a full capsule whose radius + `--dock-gap` equals `--win-r`, so its round ends sit concentric in the window's bottom corners.
- **Header** logo and icons sit directly on the background — no bar, chips or fills (`IconButton variant="bare"`).
- **Motion** one spring curve (`--ease-spring`) for press, toggles and thumbs; `ease-out` for entrances. Honors OS *reduce motion* and an in-app switch.
- **Theme switch** circular reveal from the tap point (View Transitions API), no-flash boot script, *Auto* follows the OS.
- **Ambient aura** soft blobs tinted by the artwork drift behind the UI while music plays.
- **Generative artwork** every artist, show, book and genre gets a deterministic mesh-gradient cover; images fall back to it on error.
- **Icon-only controls** every button has an accessible name that doubles as a tooltip.
- Brand mark: a converging “V” stroke around a resonant accent dot (`public/icon.svg`).

## Sections

Home · Search · Library & Playlists · Bookmarks (artists, albums, shows, books, stations, videos, wiki…) · Inbox (notifications) · Podcasts · Radio · Audiobooks · Video · Albums · Artists · Genres · Timeline (year by year) · Wiki (music history) · Profile (sound persona, listening DNA, linked accounts) · Settings (account, sources, switches, EQ faders, output, speed).

Player modes: **Dock** (desktop capsule) / **Mini** (phone), **Cover** (square, artwork only — transport, scrubber, volume, speed, sleep and lyrics appear on hover), **Micro** (opaque floating capsule) and **Nano** (opaque orb with progress ring).

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

The built-in catalogue (`src/state/state-catalog.ts`) is demo data with short royalty-free previews; everything under *Live sources* is real. The *Lossless*, *Normalize*, *Gapless*, *Crossfade*, *Explicit*, *Data saver*, *Offline* and *Downloads* settings are stored preferences that don't change playback yet.
