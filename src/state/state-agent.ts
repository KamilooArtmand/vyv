// ─────────────────────────────────────────────────────────────
// state-agent.ts: Natural Language Music Agent & Voice
// ─────────────────────────────────────────────────────────────

import { ALBUMS, ARTISTS, BOOKS, GENRES, SHOWS, STATIONS, TIMELINE, WIKI, artistById, createPlaylist, allTracks, libraryStore, toggleBookmark, toggleFavorite } from './state-catalog';
import { AudioEngine, cycleRepeat, next, playQueue, playTrack, playerStore, prev, setSleep, setSpeed, setVolume, toggleShuffle } from './state-player';
import { applyTheme, navigate, setMode, settingsStore, toast, uiStore } from './state-ui';
import type { AgentAction, AgentContext, AgentMessage, AgentReply, Mood, Playlist, RouteName } from '../core/core-types';

const SECTIONS: [RegExp, RouteName][] = [
  [/setting|preference|تنظیم/, 'settings'],
  [/profile|account|پروفایل/, 'profile'],
  [/playlist|library|کتابخانه|پلی.?لیست/, 'library'],
  [/bookmark|saved|نشان/, 'bookmarks'],
  [/notification|inbox|اعلان/, 'notifications'],
  [/podcast|پادکست/, 'podcasts'],
  [/radio|station|رادیو/, 'radio'],
  [/audiobook|book|کتاب/, 'audiobooks'],
  [/album|آلبوم/, 'albums'],
  [/artist|هنرمند|خواننده/, 'artists'],
  [/genre|ژانر|سبک/, 'genres'],
  [/timeline|year by year|تایم.?لاین|سال/, 'timeline'],
  [/wiki|history|ویکی|تاریخ/, 'wiki'],
  [/search|جستجو/, 'search'],
  [/home|خانه/, 'home'],
];

const MOODS: [RegExp, Mood, string][] = [
  [/calm|relax|chill|sleep|unwind|آرام|آروم|خواب/, 'calm', 'Calm'],
  [/focus|study|work|concentrat|code|تمرکز|مطالعه|کار/, 'focus', 'Focus'],
  [/energy|workout|gym|party|upbeat|run|انرژی|ورزش|شاد/, 'energy', 'Energy'],
  [/night|drive|late|midnight|شب|رانندگی/, 'night', 'Night Drive'],
  [/happy|sunny|morning|bright|صبح|خوشحال/, 'happy', 'Sunny'],
  [/sad|melanchol|rain|blue|غم|بارون|باران|دلتنگ/, 'melancholy', 'Rainy Day'],
];

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();

const DEFAULT_SUGGESTIONS = ['Play something calm', 'Music from 1982', 'Tell me about jazz', 'Dark mode'];

export function interpret(input: string, ctx: AgentContext): AgentReply {
  const raw = norm(input);
  const { tracks, current } = ctx;

  if (!raw) {
    return { text: 'Ask for a mood, an artist, a year — or tell me what to do.', action: { type: 'none' }, suggestions: DEFAULT_SUGGESTIONS };
  }

  // Theme
  if (/(dark|obsidian|تاریک|شب)\s*(mode|theme|تم|حالت)?/.test(raw) && /mode|theme|تم|حالت|dark|obsidian/.test(raw) && !/drive|play/.test(raw)) {
    return { text: 'Obsidian on. Easy on the eyes.', action: { type: 'theme', theme: 'dark' } };
  }
  if (/(light|porcelain|روشن)\s*(mode|theme|تم|حالت)?/.test(raw) && /mode|theme|تم|حالت|light|porcelain/.test(raw) && !/play|پخش/.test(raw)) {
    return { text: 'Porcelain on. Bright and airy.', action: { type: 'theme', theme: 'light' } };
  }
  if (/auto(matic)? (mode|theme)|system theme/.test(raw)) {
    return { text: 'Theme now follows your system.', action: { type: 'theme', theme: 'auto' } };
  }

  // Volume
  const vol = raw.match(/(?:volume|صدا)\D*(\d{1,3})/);
  if (vol) {
    const v = Math.min(100, Number(vol[1]));
    return { text: `Volume ${v}%.`, action: { type: 'volume', value: v / 100 } };
  }
  if (/louder|turn (it )?up|بلندتر/.test(raw)) return { text: 'Turned it up.', action: { type: 'volume', value: 1 } };
  if (/quieter|softer|turn (it )?down|آرام.?تر|یواش/.test(raw)) return { text: 'Brought it down.', action: { type: 'volume', value: 0.35 } };

  // Sleep timer
  const sleep = raw.match(/(?:sleep|timer|stop in|تایمر)\D*(\d{1,3})/);
  if (sleep) {
    const m = Number(sleep[1]);
    return { text: `Sleep timer set — music fades out in ${m} min.`, action: { type: 'sleep', minutes: m } };
  }

  // Speed
  const speed = raw.match(/(\d(?:\.\d+)?)\s*x\b|speed\D*(\d(?:\.\d+)?)/);
  if (speed) {
    const v = Math.min(3, Math.max(0.5, Number(speed[1] ?? speed[2])));
    return { text: `Playback speed ${v}×.`, action: { type: 'speed', value: v } };
  }

  // Transport
  if (/^(pause|stop|hold|halt)\b|توقف|مکث|قطع/.test(raw)) return { text: 'Paused.', action: { type: 'pause' } };
  if (/^(next|skip)\b|بعدی|رد کن/.test(raw)) return { text: 'Skipping ahead.', action: { type: 'next' } };
  if (/^(prev|previous|back|go back)\b|قبلی/.test(raw)) return { text: 'Going back.', action: { type: 'prev' } };
  if (/^(resume|continue|play)$|^ادامه|^پخش$/.test(raw)) return { text: 'Resuming.', action: { type: 'play' } };
  if (/shuffle|درهم|تصادفی/.test(raw)) return { text: 'Shuffle toggled.', action: { type: 'shuffle' } };
  if (/repeat|loop|تکرار/.test(raw)) return { text: 'Repeat mode changed.', action: { type: 'repeat' } };
  if (/^(like|love|favou?rite)( this| it)?|دوست دارم|لایک/.test(raw) && current) return { text: 'Added to your likes.', action: { type: 'favorite', trackId: current.id } };
  if (/^(bookmark|save)( this| it)?$|ذخیره|نشان کن/.test(raw) && current) return { text: 'Bookmarked.', action: { type: 'bookmark', kind: 'track', id: current.id } };

  // Modes
  if (/nano/.test(raw)) return { text: 'Nano mode.', action: { type: 'mode', mode: 'Nano' } };
  if (/micro|mini ?player|mini mode/.test(raw)) return { text: 'Micro mode.', action: { type: 'mode', mode: 'Micro' } };
  if (/lyric|cover|full ?screen|now playing|متن/.test(raw)) return { text: 'Now playing, full screen.', action: { type: 'mode', mode: 'Cover' } };

  // What's playing
  if (/what('s| is) (this|playing)|who (is this|sings)|name of (this|the) song|این آهنگ/.test(raw)) {
    if (!current) return { text: 'Nothing is playing yet.', action: { type: 'none' }, suggestions: DEFAULT_SUGGESTIONS };
    const a = artistById(current.artistId);
    return {
      text: `“${current.title}” by ${current.artist}${current.year ? `, ${current.year}` : ''}.${a ? ` ${a.bio}` : ''}`,
      action: { type: 'none' },
      cards: a ? [{ kind: 'artist', id: a.id }] : undefined,
      suggestions: ['More like this', 'Open artist', 'Show lyrics'],
    };
  }
  if (/more like this|similar|مشابه/.test(raw) && current) {
    const pool = tracks.filter((t) => t.id !== current.id && (t.genreId === current.genreId || t.moods?.some((m) => current.moods?.includes(m))));
    if (pool.length) return { text: `Queued ${pool.length} tracks in the spirit of “${current.title}”.`, action: { type: 'play', track: pool[0], queue: pool } };
  }

  // Navigation
  if (/^(open|go to|show( me)?|take me to|برو|باز کن|نشان بده)/.test(raw) || (raw.split(' ').length <= 2 && !/^(play|پخش)/.test(raw))) {
    for (const [re, name] of SECTIONS) {
      if (re.test(raw) && !(name === 'wiki' && /\d{4}/.test(raw))) {
        if (name === 'artists' && /open artist/.test(raw) && current?.artistId) {
          return { text: `Opening ${current.artist}.`, action: { type: 'navigate', route: { name: 'artist', id: current.artistId } } };
        }
        return { text: `Opening ${name}.`, action: { type: 'navigate', route: { name } } };
      }
    }
  }

  // Year → timeline
  const year = raw.match(/\b(18[5-9]\d|19\d\d|20[0-2]\d)\b/);
  if (year) {
    const y = Number(year[1]);
    const nearest = TIMELINE.reduce((a, b) => (Math.abs(b.year - y) < Math.abs(a.year - y) ? b : a));
    const exact = nearest.year === y;
    const eraTracks = tracks.filter((t) => t.year && Math.abs(t.year - y) <= 2);
    return {
      text: `${exact ? y : `Closest milestone: ${nearest.year}`} — ${nearest.headline}. ${nearest.events[0]}`,
      action: { type: 'navigate', route: { name: 'timeline', id: String(nearest.year) } },
      cards: nearest.wikiId ? [{ kind: 'wiki', id: nearest.wikiId }] : undefined,
      suggestions: eraTracks.length ? [`Play music from ${y}`] : ['Open wiki', `Music from ${nearest.year + 10}`],
    };
  }

  // Knowledge
  const about = raw.match(/(?:tell me about|who is|who are|what is|history of|explain|درباره|تاریخچه)\s+(.+)/);
  if (about) {
    const q = about[1].replace(/[?.!]/g, '').trim();
    const w = WIKI.find((a) => norm(a.title).includes(q) || a.genreId === q || norm(a.summary).includes(q));
    const g = GENRES.find((x) => norm(x.name).includes(q) || q.includes(norm(x.name)));
    const a = ARTISTS.find((x) => norm(x.name).includes(q));
    if (a) return { text: `${a.name} — ${a.bio} From ${a.origin}, active since ${a.since}.`, action: { type: 'none' }, cards: [{ kind: 'artist', id: a.id }], suggestions: [`Play ${a.name}`] };
    if (w) return { text: `${w.title} (${w.era}). ${w.sections[0].body}`, action: { type: 'none' }, cards: [{ kind: 'wiki', id: w.id }], suggestions: w.genreId ? [`Play ${w.genreId}`] : undefined };
    if (g) return { text: `${g.name} — ${g.about}`, action: { type: 'none' }, cards: [{ kind: 'genre', id: g.id }], suggestions: [`Play ${g.name}`] };
  }

  // Mood → smart mix
  for (const [re, mood, label] of MOODS) {
    if (re.test(raw)) {
      const mix = tracks.filter((t) => t.moods?.includes(mood));
      if (mix.length) {
        return {
          text: `Built a ${label} mix — ${mix.length} tracks. Starting with “${mix[0].title}”.`,
          action: { type: 'playlist', playlist: { id: `mood-${mood}`, name: `${label} Mix`, description: `Made by your agent for a ${label.toLowerCase()} moment.`, color: mix[0].dominantColorHex, trackIds: mix.map((t) => t.id), smart: true, createdAt: new Date().toISOString() } },
          suggestions: ['Save as playlist', 'Shuffle', 'Sleep in 30'],
        };
      }
    }
  }

  // Play <query>
  const play = raw.match(/^(?:play|listen to|put on|پخش|بذار)\s+(.+)/);
  const q = (play ? play[1] : raw).replace(/^(some|the|a)\s+/, '').replace(/\b(music|songs?|by)\b/g, '').trim();

  const genre = GENRES.find((g) => norm(g.name) === q || g.id === q);
  if (genre) {
    const list = tracks.filter((t) => t.genreId === genre.id);
    const radio = STATIONS.find((s) => s.genreId === genre.id);
    if (list.length) return { text: `Playing ${genre.name}.`, action: { type: 'play', track: list[0], queue: list }, cards: [{ kind: 'genre', id: genre.id }] };
    if (radio) return { text: `Tuning to ${radio.title} — live ${genre.name}.`, action: { type: 'play', track: radio, queue: [radio] } };
  }

  const artist = ARTISTS.find((a) => norm(a.name).includes(q) || (q.length > 3 && q.includes(norm(a.name))));
  if (artist) {
    const list = tracks.filter((t) => t.artistId === artist.id);
    if (list.length) return { text: `Playing ${artist.name}.`, action: { type: 'play', track: list[0], queue: list }, cards: [{ kind: 'artist', id: artist.id }] };
  }

  const station = STATIONS.find((s) => norm(s.title).includes(q) || norm(s.artist).includes(q));
  if (station && play) return { text: `Tuning to ${station.title}.`, action: { type: 'play', track: station, queue: [station] } };

  const matches = tracks.filter((t) => norm(`${t.title} ${t.artist} ${t.album}`).includes(q));
  if (matches.length && play) return { text: `Playing “${matches[0].title}” by ${matches[0].artist}.`, action: { type: 'play', track: matches[0], queue: matches } };

  // Play music from a given year
  const yearPlay = raw.match(/music from (\d{4})/);
  if (yearPlay) {
    const y = Number(yearPlay[1]);
    const list = tracks.filter((t) => t.year && Math.abs(t.year - y) <= 2);
    if (list.length) return { text: `Playing ${list.length} tracks from around ${y}.`, action: { type: 'play', track: list[0], queue: list } };
  }

  // Search fallback
  const cards: AgentReply['cards'] = [
    ...ARTISTS.filter((a) => norm(a.name).includes(q)).map((a) => ({ kind: 'artist' as const, id: a.id })),
    ...ALBUMS.filter((a) => norm(a.title).includes(q)).map((a) => ({ kind: 'album' as const, id: a.id })),
    ...SHOWS.filter((s) => norm(s.title).includes(q)).map((s) => ({ kind: 'show' as const, id: s.id })),
    ...BOOKS.filter((b) => norm(`${b.title} ${b.author}`).includes(q)).map((b) => ({ kind: 'book' as const, id: b.id })),
    ...WIKI.filter((w) => norm(`${w.title} ${w.summary}`).includes(q)).map((w) => ({ kind: 'wiki' as const, id: w.id })),
    ...matches.slice(0, 4).map((t) => ({ kind: 'track' as const, id: t.id })),
  ].slice(0, 6);

  if (cards.length) {
    return { text: `Here’s what I found for “${input.trim()}”.`, action: { type: 'none' }, cards };
  }
  return {
    text: 'I couldn’t find that. Try a mood, an artist, a year, or a command like “sleep in 20”.',
    action: { type: 'none' },
    suggestions: DEFAULT_SUGGESTIONS,
  };
}

/** Predictive nudge shown on Home — based on time of day and habits. */
export function predict(ctx: AgentContext): { title: string; prompt: string; mood: Mood } {
  const h = (ctx.now ?? new Date()).getHours();
  if (h < 6) return { title: 'Still up? A slow night mix is ready.', prompt: 'Play something for the night', mood: 'night' };
  if (h < 11) return { title: 'Morning light — start with something bright.', prompt: 'Play something happy', mood: 'happy' };
  if (h < 17) return { title: 'Deep work window. Wordless focus, no ads, no breaks.', prompt: 'Play focus music', mood: 'focus' };
  if (h < 21) return { title: 'Wind down. A calm mix tuned to your evenings.', prompt: 'Play something calm', mood: 'calm' };
  return { title: 'Night drive energy — neon and rain.', prompt: 'Play night drive', mood: 'night' };
}

// ── Conversation loop ────────────────────────────────────────
let lastMix: Playlist | null = null;
const id = () => Math.random().toString(36).slice(2, 9);

function say(msg: Omit<AgentMessage, 'id'>) {
  uiStore.set((s) => ({ agent: [...s.agent, { ...msg, id: id() }].slice(-40) }));
}

/** Send a prompt to the agent, execute the resulting action and log the dialogue. */
export function ask(input: string) {
  const text = input.trim();
  if (!text) return;
  say({ role: 'user', text });
  uiStore.set({ agentBusy: true });

  // A short, human-feeling pause before the agent answers.
  setTimeout(() => {
    uiStore.set({ agentBusy: false });

    if (/save (it |this )?(as|to) (a )?playlist|ذخیره.*پلی/.test(text.toLowerCase()) && lastMix) {
      const pl = createPlaylist(lastMix.name, lastMix.trackIds, true, lastMix.description);
      say({ role: 'agent', text: `Saved “${pl.name}” to your library.`, suggestions: ['Open library'] });
      return;
    }

    const { track } = playerStore.get();
    const reply = interpret(text, { tracks: allTracks(), current: track, history: libraryStore.get().history });
    const a: AgentAction = reply.action;

    switch (a.type) {
      case 'play':
        if (a.track) playTrack(a.track, a.queue);
        else AudioEngine.play();
        break;
      case 'pause':
        AudioEngine.pause();
        break;
      case 'next':
        next();
        break;
      case 'prev':
        prev();
        break;
      case 'navigate':
        navigate(a.route);
        break;
      case 'theme':
        settingsStore.set({ theme: a.theme });
        applyTheme(a.theme, { x: innerWidth / 2, y: innerHeight / 2 });
        break;
      case 'volume':
        setVolume(a.value);
        break;
      case 'shuffle':
        toggleShuffle();
        break;
      case 'repeat':
        cycleRepeat();
        break;
      case 'favorite':
        toggleFavorite(a.trackId);
        break;
      case 'bookmark':
        toggleBookmark(a.kind, a.id);
        break;
      case 'sleep':
        setSleep(a.minutes);
        break;
      case 'speed':
        setSpeed(a.value);
        break;
      case 'mode':
        setMode(a.mode);
        break;
      case 'playlist': {
        lastMix = a.playlist;
        const tracks = allTracks().filter((t) => a.playlist.trackIds.includes(t.id));
        playQueue(tracks);
        break;
      }
    }

    say({ role: 'agent', text: reply.text, cards: reply.cards, suggestions: reply.suggestions });
    if (uiStore.get().panel !== 'agent') toast(reply.text, 'sparkles');
  }, 380);
}

// ── Voice ────────────────────────────────────────────────────
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

export const voiceSupported = () =>
  typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

/** Push-to-talk via the Web Speech API. Returns a stop function. */
export function listen(onText: (t: string) => void, onEnd: () => void): () => void {
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) {
    onEnd();
    return () => {};
  }
  const rec: Recognition = new Ctor();
  rec.lang = navigator.language || 'en-US';
  rec.interimResults = false;
  rec.onresult = (e) => onText(e.results[0][0].transcript);
  rec.onend = onEnd;
  rec.onerror = onEnd;
  rec.start();
  return () => rec.stop();
}
