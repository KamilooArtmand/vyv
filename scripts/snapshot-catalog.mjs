#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// scripts/snapshot-catalog.mjs
//
// Pulls several hundred real, playable items from open sources and
// writes public/catalog/snapshot.json. The app shows this instantly
// (and offline-first) and falls back to it whenever a live API is
// slow or down; live results replace it as soon as they arrive.
//
// Runs daily in GitHub Actions (.github/workflows/refresh-catalog.yml).
// A source that fails keeps its previous section, so a bad day at one
// provider never empties the catalogue.
//
//   node scripts/snapshot-catalog.mjs
// ─────────────────────────────────────────────────────────────

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'catalog', 'snapshot.json');
const UA = 'vyv-catalog-snapshot/1.0 (+https://github.com/KamilooArtmand/vyv)';

const PALETTE = ['#ff3c00', '#8b7cff', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444'];
const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const colorFor = (seed) => PALETTE[hash(seed) % PALETTE.length];
const https = (u) => (u && u.startsWith('http://') ? u.replace('http://', 'https://') : u || undefined);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, tries = 3) {
  let err;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(20_000) });
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return await r.json();
    } catch (e) {
      err = e;
      await sleep(800 * (i + 1));
    }
  }
  throw err;
}

const uniq = (list, key = (x) => x.id) => [...new Map(list.map((x) => [key(x), x])).values()];

// ── Radio Browser ────────────────────────────────────────────
const RB = ['https://de1.api.radio-browser.info', 'https://de2.api.radio-browser.info', 'https://fi1.api.radio-browser.info'];
async function rb(path) {
  let err;
  for (const host of RB) {
    try {
      return await getJSON(host + path, 2);
    } catch (e) {
      err = e;
    }
  }
  throw err;
}
const RBQ = 'hidebroken=true&order=clickcount&reverse=true';
const station = (s) => ({
  id: `rb:${s.stationuuid}`,
  title: s.name.trim(),
  artist: [s.country || s.countrycode, s.tags.split(',').filter(Boolean).slice(0, 2).join(' · ')].filter(Boolean).join(' · ') || 'Live radio',
  album: s.language || 'Radio',
  filePath: s.url_resolved,
  durationSeconds: 0,
  dominantColorHex: colorFor(s.stationuuid),
  coverUrl: https(s.favicon),
  isFavorite: false,
  addedAt: new Date().toISOString(),
  isRadio: true,
  kind: 'radio',
  source: 'radiobrowser',
  cors: false,
  pageUrl: s.homepage || undefined,
});
const playable = (s) => s.lastcheckok === 1 && s.url_resolved?.startsWith('https://') && s.name?.trim();

async function radio() {
  const kurdishRaw = (
    await Promise.all([
      rb(`/json/stations/search?language=kurdish&${RBQ}&limit=200`),
      rb(`/json/stations/search?tag=kurdish&${RBQ}&limit=200`),
      rb(`/json/stations/search?language=sorani&${RBQ}&limit=80`),
      rb(`/json/stations/search?language=kurmanji&${RBQ}&limit=80`),
      rb(`/json/stations/search?tag=kurdi&${RBQ}&limit=80`),
    ])
  ).flat();
  const kurdish = uniq(kurdishRaw.filter(playable), (s) => s.stationuuid).slice(0, 160).map(station);
  const tags = ['jazz', 'classical', 'ambient', 'news', 'persian', 'arabic', 'turkish', 'folk', 'world', 'lounge', 'electronic', 'pop'];
  const byTag = {};
  for (const tag of tags) {
    const list = await rb(`/json/stations/search?tag=${tag}&${RBQ}&limit=60`);
    byTag[tag] = uniq(list.filter(playable), (s) => s.stationuuid).slice(0, 24).map(station);
  }
  const top = (await rb(`/json/stations/topclick/200?hidebroken=true`)).filter(playable).slice(0, 80).map(station);
  return { kurdish, world: top, byTag };
}

// ── Audius ───────────────────────────────────────────────────
const AUDIUS = 'https://api.audius.co/v1';
const audius = (t, group) => ({
  id: `au:${t.id}`,
  title: t.title,
  artist: t.user.name,
  album: t.genre || 'Audius',
  filePath: `${AUDIUS}/tracks/${t.id}/stream?app_name=vyv`,
  durationSeconds: t.duration,
  dominantColorHex: colorFor(t.id),
  coverUrl: t.artwork?.['480x480'] || t.artwork?.['1000x1000'],
  isFavorite: false,
  addedAt: new Date().toISOString(),
  kind: 'music',
  source: 'audius',
  cors: true,
  pageUrl: `https://audius.co${t.permalink}`,
  year: t.release_date ? new Date(t.release_date).getFullYear() : undefined,
  group,
});

async function music() {
  const genres = ['', 'Electronic', 'Hip-Hop/Rap', 'Pop', 'Rock', 'Ambient', 'World', 'Jazz', 'Classical', 'Folk', 'Acoustic', 'R&B/Soul', 'Lo-Fi', 'Alternative'];
  const out = {};
  for (const g of genres) {
    const q = g ? `&genre=${encodeURIComponent(g)}` : '';
    const r = await getJSON(`${AUDIUS}/tracks/trending?app_name=vyv&time=month${q}`);
    out[g || 'Trending'] = r.data.filter((t) => t.is_streamable !== false).slice(0, 24).map((t) => audius(t, g || 'Trending'));
  }
  const kurdish = uniq(
    (
      await Promise.all(['kurdish', 'kurdî', 'kurdistan', 'dengbêj', 'کوردی'].map((q) => getJSON(`${AUDIUS}/tracks/search?query=${encodeURIComponent(q)}&app_name=vyv&limit=40`)))
    )
      .flatMap((r) => r.data)
      .filter((t) => t.is_streamable !== false),
  ).map((t) => audius(t, 'Kurdish'));
  out.Kurdish = kurdish.slice(0, 60);
  return out;
}

// ── Internet Archive ─────────────────────────────────────────
async function archive(query, scope, rows) {
  const url =
    `https://archive.org/advancedsearch.php?q=${encodeURIComponent(`(${query}) AND ${scope}`)}` +
    `&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=mediatype&fl[]=year&sort[]=downloads+desc&rows=${rows}&output=json`;
  const r = await getJSON(url);
  return r.response.docs.map((d) => ({
    id: d.identifier,
    title: d.title ?? d.identifier,
    creator: (Array.isArray(d.creator) ? d.creator[0] : d.creator) ?? 'Internet Archive',
    mediatype: d.mediatype === 'movies' ? 'movies' : 'audio',
    year: d.year ? Number(String(d.year).slice(0, 4)) : undefined,
    thumb: `https://archive.org/services/img/${d.identifier}`,
  }));
}

async function heritage() {
  return {
    kurdish: await archive('title:(kurdish OR kurdi OR kurdistan OR kurd) OR subject:(kurdish OR kurdi OR kurdistan)', 'mediatype:(audio)', 80),
    world: await archive('subject:(folk OR traditional OR "world music")', 'mediatype:(audio) AND collection:(georgeblood OR 78rpm)', 60),
    books: await archive('subject:(poetry OR philosophy OR mythology OR history)', 'collection:(librivoxaudio)', 80),
    films: await archive('subject:(documentary OR silent OR classic OR animation)', 'mediatype:(movies) AND collection:(feature_films OR prelinger OR classic_cartoons OR silent_films)', 60),
  };
}

// ── Apple Podcasts directory ─────────────────────────────────
async function podcasts() {
  const terms = ['kurdish', 'kurdî', 'کوردی', 'kurdistan', 'music history', 'world music', 'jazz', 'classical music', 'poetry', 'history'];
  const all = [];
  for (const t of terms) {
    const r = await getJSON(`https://itunes.apple.com/search?media=podcast&entity=podcast&term=${encodeURIComponent(t)}&limit=20`);
    for (const p of r.results) {
      all.push({
        id: `it:${p.collectionId}`,
        title: p.collectionName,
        host: p.artistName,
        category: p.primaryGenreName ?? 'Podcast',
        artwork: p.artworkUrl600 || p.artworkUrl100,
        pageUrl: p.collectionViewUrl,
        color: colorFor(String(p.collectionId)),
        group: t,
      });
    }
  }
  return uniq(all);
}

// ── Main ─────────────────────────────────────────────────────
const previous = await readFile(OUT, 'utf8').then(JSON.parse).catch(() => ({}));
const sections = { radio, music, heritage, podcasts };
const snapshot = { version: 1, generatedAt: new Date().toISOString() };
const report = [];

for (const [name, load] of Object.entries(sections)) {
  try {
    snapshot[name] = await load();
    report.push(`✓ ${name}`);
  } catch (e) {
    snapshot[name] = previous[name] ?? null;
    report.push(`✗ ${name} (${e.message}) — kept previous`);
  }
}

const count = (x) => (Array.isArray(x) ? x.length : x && typeof x === 'object' ? Object.values(x).reduce((a, v) => a + count(v), 0) : 0);
await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(snapshot));
console.log(report.join('\n'));
console.log(`radio ${count(snapshot.radio)} · music ${count(snapshot.music)} · heritage ${count(snapshot.heritage)} · podcasts ${count(snapshot.podcasts)} · total ${count(snapshot.radio) + count(snapshot.music) + count(snapshot.heritage) + count(snapshot.podcasts)}`);
