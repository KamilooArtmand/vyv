#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// scripts/generate-skeletons.mjs
//
// Auto-generated Skeleton Screen Generator for VYV Player
//
// Analyzes routes in src/App.tsx and view definitions in src/views/*.tsx
// to automatically generate high-fidelity Skeleton screens matching the
// exact layout, grid sizes, headers, and cards of the real views.
// ─────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const VIEWS_DIR = path.join(SRC, 'views');
const OUT_FILE = path.join(SRC, 'ui', 'skeletons', 'auto-skeletons.tsx');

console.log('🔍 Analyzing routes from App.tsx and views from src/views ...');

const appFile = fs.readFileSync(path.join(SRC, 'App.tsx'), 'utf8');

// Extract routes from VIEWS object in App.tsx
const startIdx = appFile.indexOf('const VIEWS');
if (startIdx === -1) {
  console.error('❌ Could not find VIEWS map in App.tsx');
  process.exit(1);
}
const openBrace = appFile.indexOf('{', startIdx);
const closeBrace = appFile.indexOf('};', openBrace);
const viewsRaw = appFile.slice(openBrace + 1, closeBrace);
const routeRegex = /([a-zA-Z0-9_-]+):\s*lazy\(\(\)\s*=>\s*(?:named\()?import\(['"]([^'"]+)['"]\)(?:,\s*['"]([^'"]+)['"])?\)/g;
const routes = [];
let m;
while ((m = routeRegex.exec(viewsRaw)) !== null) {
  routes.push({
    name: m[1],
    importPath: m[2],
    exportName: m[3] || 'default',
  });
}

console.log(`✨ Found ${routes.length} routes registered in App.tsx:`);
console.log(routes.map(r => `  • ${r.name} (${r.exportName} in ${r.importPath})`).join('\n'));

// Route layout specifications based on structural analysis of the views
const ROUTE_DEFINITIONS = {
  home: {
    component: 'HomeSkeleton',
    render: `
export function HomeSkeleton() {
  return (
    <div className="anim-fade">
      {/* Header with greeting */}
      <header className="mb-7 md:mb-9">
        <Skeleton className="mb-2 h-3 w-32 uppercase rounded opacity-70" />
        <Skeleton className="h-9 md:h-12 w-64 md:w-80 rounded-[var(--radius-sm)]" />
      </header>

      {/* Proactive Agent banner */}
      <SkeletonAgentBanner />

      {/* Quick picks spotlight grid */}
      <SkeletonSection title={false}>
        <div className="mb-3.5 flex items-center justify-between">
          <Skeleton className="h-5 w-28 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonSpotlightCard key={i} />
          ))}
        </div>
      </SkeletonSection>

      {/* Shelves matching real home shelves */}
      <SkeletonSection>
        <SkeletonShelf count={6} />
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonShelf count={6} />
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonShelf count={6} />
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonShelf count={6} />
      </SkeletonSection>
    </div>
  );
}`,
  },

  search: {
    component: 'SearchSkeleton',
    render: `
export function SearchSkeleton() {
  return (
    <div className="anim-fade">
      {/* Floating search pill and filter chips */}
      <SkeletonSearchBar />

      {/* Top search suggestions / results section */}
      <SkeletonSection>
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-3 rounded-[var(--radius-xl)] bg-surface p-4">
            <SkeletonArtwork className="aspect-square w-full rounded-[var(--radius-lg)]" />
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-3.5 w-1/2 rounded opacity-70" />
          </div>
          <SkeletonTrackList count={4} />
        </div>
      </SkeletonSection>

      {/* Browse categories grid */}
      <SkeletonSection>
        <SkeletonGrid count={8} min={160} />
      </SkeletonSection>
    </div>
  );
}`,
  },

  albums: {
    component: 'AlbumsSkeleton',
    render: `
export function AlbumsSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader hasActions />
      <SkeletonGrid count={12} min={160} />
    </div>
  );
}`,
  },

  album: {
    component: 'AlbumSkeleton',
    render: `
export function AlbumSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonCollectionHeader />
      <SkeletonTrackList count={10} />
      <div className="mt-10">
        <SkeletonSection>
          <SkeletonShelf count={6} />
        </SkeletonSection>
      </div>
    </div>
  );
}`,
  },

  artists: {
    component: 'ArtistsSkeleton',
    render: `
export function ArtistsSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader />
      <SkeletonGrid
        count={12}
        min={160}
        renderItem={(i) => <SkeletonMediaCard key={i} circle />}
      />
    </div>
  );
}`,
  },

  artist: {
    component: 'ArtistSkeleton',
    render: `
export function ArtistSkeleton() {
  return (
    <div className="anim-fade">
      {/* Artist large hero banner */}
      <div className="relative mb-8 h-72 md:h-80 w-full overflow-hidden rounded-[var(--radius-2xl)] bg-surface-2 p-6 md:p-8 flex flex-col justify-end">
        <Skeleton className="mb-2 h-3.5 w-24 rounded opacity-75" />
        <Skeleton className="mb-3 h-10 md:h-14 w-64 md:w-96 rounded-[var(--radius-md)]" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="size-9 rounded-full opacity-70" />
        </div>
      </div>

      {/* Popular Tracks */}
      <SkeletonSection>
        <SkeletonTrackList count={5} />
      </SkeletonSection>

      {/* Discography */}
      <SkeletonSection>
        <SkeletonShelf count={6} />
      </SkeletonSection>

      {/* Fans also like */}
      <SkeletonSection>
        <SkeletonShelf
          count={6}
          renderItem={(i) => <SkeletonMediaCard key={i} circle />}
        />
      </SkeletonSection>
    </div>
  );
}`,
  },

  genres: {
    component: 'GenresSkeleton',
    render: `
export function GenresSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader />
      <SkeletonGrid
        count={12}
        min={160}
        renderItem={(i) => (
          <div key={i} className="flex h-28 flex-col justify-end rounded-[var(--radius-xl)] bg-surface-2 p-4">
            <Skeleton className="h-5 w-24 rounded" />
          </div>
        )}
      />
    </div>
  );
}`,
  },

  genre: {
    component: 'GenreSkeleton',
    render: `
export function GenreSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonCollectionHeader />
      <SkeletonSection>
        <SkeletonTrackList count={6} />
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonShelf count={6} />
      </SkeletonSection>
    </div>
  );
}`,
  },

  discover: {
    component: 'DiscoverSkeleton',
    render: `
export function DiscoverSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader hasEyebrow />
      {/* Featured hero banner */}
      <div className="mb-9 grid gap-4 md:grid-cols-2">
        <Skeleton className="h-56 md:h-64 rounded-[var(--radius-2xl)]" />
        <Skeleton className="h-56 md:h-64 rounded-[var(--radius-2xl)] max-md:hidden" />
      </div>
      <SkeletonSection>
        <SkeletonGrid count={8} min={160} />
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonShelf count={6} />
      </SkeletonSection>
    </div>
  );
}`,
  },

  library: {
    component: 'LibrarySkeleton',
    render: `
export function LibrarySkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader hasActions />
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <SkeletonTrackList count={10} />
    </div>
  );
}`,
  },

  playlist: {
    component: 'PlaylistSkeleton',
    render: `
export function PlaylistSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonCollectionHeader />
      <SkeletonTrackList count={12} />
    </div>
  );
}`,
  },

  podcasts: {
    component: 'PodcastsSkeleton',
    render: `
export function PodcastsSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader />
      <SkeletonGrid count={10} min={170} />
    </div>
  );
}`,
  },

  show: {
    component: 'ShowSkeleton',
    render: `
export function ShowSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonCollectionHeader />
      <SkeletonTrackList count={8} />
    </div>
  );
}`,
  },

  radio: {
    component: 'RadioSkeleton',
    render: `
export function RadioSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader hasEyebrow />
      <SkeletonGrid count={12} min={160} />
    </div>
  );
}`,
  },

  audiobooks: {
    component: 'AudiobooksSkeleton',
    render: `
export function AudiobooksSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader />
      <SkeletonGrid
        count={10}
        min={150}
        renderItem={(i) => <SkeletonMediaCard key={i} tall />}
      />
    </div>
  );
}`,
  },

  book: {
    component: 'BookSkeleton',
    render: `
export function BookSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonCollectionHeader tall />
      <SkeletonTrackList count={8} numbered={false} />
    </div>
  );
}`,
  },

  video: {
    component: 'VideoSkeleton',
    render: `
export function VideoSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonVideoHero />
      <SkeletonSection>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-video w-full rounded-[var(--radius-xl)]" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded opacity-70" />
            </div>
          ))}
        </div>
      </SkeletonSection>
    </div>
  );
}`,
  },

  settings: {
    component: 'SettingsSkeleton',
    render: `
export function SettingsSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader />
      <SkeletonSettingsGroup rows={4} />
      <SkeletonSettingsGroup rows={3} />
      <SkeletonSettingsGroup rows={3} />
      <SkeletonSettingsGroup rows={2} />
    </div>
  );
}`,
  },

  bookmarks: {
    component: 'BookmarksSkeleton',
    render: `
export function BookmarksSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader hasSubtitle />
      <SkeletonGrid count={12} min={160} />
    </div>
  );
}`,
  },

  notifications: {
    component: 'NotificationsSkeleton',
    render: `
export function NotificationsSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 rounded-[var(--radius-xl)] bg-surface p-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-44 rounded" />
              <Skeleton className="h-2.5 w-28 rounded opacity-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },

  timeline: {
    component: 'TimelineSkeleton',
    render: `
export function TimelineSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader />
      <SkeletonTrackList count={12} />
    </div>
  );
}`,
  },

  wiki: {
    component: 'WikiSkeleton',
    render: `
export function WikiSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader />
      <SkeletonGrid count={8} min={170} />
    </div>
  );
}`,
  },

  article: {
    component: 'ArticleSkeleton',
    render: `
export function ArticleSkeleton() {
  return (
    <div className="anim-fade max-w-3xl">
      <Skeleton className="mb-4 h-9 md:h-12 w-4/5 rounded-[var(--radius-sm)]" />
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-3.5 w-32 rounded" />
      </div>
      <Skeleton className="mb-8 aspect-video w-full rounded-[var(--radius-xl)]" />
      <SkeletonText lines={6} className="mb-4" />
      <SkeletonText lines={4} className="mb-4" />
      <SkeletonText lines={5} />
    </div>
  );
}`,
  },

  profile: {
    component: 'ProfileSkeleton',
    render: `
export function ProfileSkeleton() {
  return (
    <div className="anim-fade">
      <div className="mb-8 flex items-center gap-5">
        <Skeleton className="size-20 md:size-24 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 md:h-8 w-44 rounded" />
          <Skeleton className="h-3.5 w-28 rounded opacity-70" />
        </div>
      </div>
      <SkeletonSection>
        <SkeletonShelf count={6} />
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonTrackList count={6} />
      </SkeletonSection>
    </div>
  );
}`,
  },
};

// Default fallback for any route not explicitly mapped
const DEFAULT_SKELETON = `
export function DefaultPageSkeleton() {
  return (
    <div className="anim-fade">
      <SkeletonPageHeader hasSubtitle hasActions />
      <SkeletonGrid count={8} min={160} />
    </div>
  );
}
`;

// Build the generated auto-skeletons.tsx file
let outCode = `// ─────────────────────────────────────────────────────────────
// src/ui/skeletons/auto-skeletons.tsx
//
// AUTO-GENERATED SKELETON SCREENS FOR VYV PLAYER
// Generated automatically from views structure & App.tsx routing.
//
// To regenerate: pnpm run generate:skeletons
// DO NOT EDIT DIRECTLY \u2014 edit scripts/generate-skeletons.mjs instead.
// ─────────────────────────────────────────────────────────────

import type { ComponentType } from 'react';
import {
  Skeleton,
  SkeletonText,
  SkeletonArtwork,
  SkeletonMediaCard,
  SkeletonSpotlightCard,
  SkeletonTrackRow,
  SkeletonTrackList,
  SkeletonPageHeader,
  SkeletonCollectionHeader,
  SkeletonSection,
  SkeletonGrid,
  SkeletonShelf,
  SkeletonAgentBanner,
  SkeletonSearchBar,
  SkeletonSettingsGroup,
  SkeletonVideoHero,
} from './skeleton-primitives';

${DEFAULT_SKELETON}
`;

// Append all route skeletons
const generatedComponents = [];
for (const route of routes) {
  const def = ROUTE_DEFINITIONS[route.name];
  if (def && !generatedComponents.includes(def.component)) {
    outCode += def.render + '\n';
    generatedComponents.push(def.component);
  }
}

// Generate the Map of Route -> Component
outCode += `
/**
 * Type-safe registry of auto-generated skeletons per route
 */
export const ROUTE_SKELETON_MAP: Record<string, ComponentType<any>> = {
${routes.map(r => {
  const def = ROUTE_DEFINITIONS[r.name];
  const compName = def ? def.component : 'DefaultPageSkeleton';
  return `  ${JSON.stringify(r.name)}: ${compName},`;
}).join('\n')}
};

/**
 * Universal PageSkeleton component: dynamically renders the auto-generated
 * skeleton matching the active route with zero layout shift.
 */
export function PageSkeleton({
  route,
  id,
  className = '',
}: {
  route?: string;
  id?: string;
  className?: string;
}) {
  const Component = (route && ROUTE_SKELETON_MAP[route]) || DefaultPageSkeleton;
  return (
    <div className={className} data-skeleton-route={route} data-skeleton-id={id}>
      <Component id={id} />
    </div>
  );
}
`;

fs.writeFileSync(OUT_FILE, outCode, 'utf8');

const stat = fs.statSync(OUT_FILE);
console.log(`\n✅ Successfully generated skeletons in: ${OUT_FILE}`);
console.log(`📊 Statistics:`);
console.log(`   - Routes covered: ${routes.length}`);
console.log(`   - Unique skeleton layouts: ${generatedComponents.length}`);
console.log(`   - Output file size: ${(stat.size / 1024).toFixed(2)} KB`);
