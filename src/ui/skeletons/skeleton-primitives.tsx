import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../core/core-utils';

/**
 * Base atomic skeleton block with shimmer animation
 */
export function Skeleton({
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-[var(--radius-sm)]", className)}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Text line skeleton simulator
 */
export function SkeletonText({
  lines = 1,
  className,
  lineClassName = "h-3.5",
}: {
  lines?: number;
  className?: string;
  lineClassName?: string;
}) {
  if (lines === 1) {
    return <Skeleton className={cn("w-3/4", lineClassName, className)} />;
  }

  // Predefined pleasant width variations for multi-line text
  const widths = ['w-full', 'w-11/12', 'w-4/5', 'w-3/4', 'w-2/3', 'w-1/2'];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(lineClassName, widths[i % widths.length])}
        />
      ))}
    </div>
  );
}

/**
 * Media artwork placeholder (square, circle avatar, or tall book jacket)
 */
export function SkeletonArtwork({
  aspect = 'square',
  circle = false,
  className,
}: {
  aspect?: 'square' | 'tall' | 'video';
  circle?: boolean;
  className?: string;
}) {
  return (
    <Skeleton
      className={cn(
        "w-full",
        circle
          ? "aspect-square rounded-full"
          : aspect === 'tall'
            ? "aspect-[3/4] rounded-[var(--radius-lg)]"
            : aspect === 'video'
              ? "aspect-video rounded-[var(--radius-xl)]"
              : "aspect-square rounded-[var(--radius-md)]",
        className
      )}
    />
  );
}

/**
 * Media card skeleton matching MediaCard in ui-components
 */
export function SkeletonMediaCard({
  circle = false,
  tall = false,
  className,
}: {
  circle?: boolean;
  tall?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("group flex flex-col min-w-0", className)}>
      <SkeletonArtwork
        circle={circle}
        aspect={tall ? 'tall' : 'square'}
        className="mb-2.5 shadow-sm"
      />
      <Skeleton className={cn("h-3.5 rounded", circle ? "mx-auto w-20" : "w-4/5")} />
      {!circle && <Skeleton className="mt-1.5 h-2.5 w-1/2 rounded opacity-75" />}
    </div>
  );
}

/**
 * Quick-pick spotlight card skeleton matching VyvSpotlightCard on HomeView
 */
export function SkeletonSpotlightCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-14 md:h-16 items-center gap-3 overflow-hidden rounded-[var(--radius-md)] bg-surface pr-3",
        className
      )}
    >
      <Skeleton className="aspect-square h-full !rounded-none" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-28 md:w-36 rounded" />
        <Skeleton className="h-2.5 w-16 md:w-20 rounded opacity-60" />
      </div>
    </div>
  );
}

/**
 * Track row skeleton matching TrackRow in ui-components
 */
export function SkeletonTrackRow({
  numbered = true,
  className,
}: {
  numbered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-3 rounded-[var(--radius-md)] px-3",
        className
      )}
    >
      {numbered && <Skeleton className="h-3 w-4 shrink-0 rounded" />}
      <Skeleton className="size-9 shrink-0 rounded-[var(--radius-sm)]" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-36 md:w-56 rounded" />
        <Skeleton className="h-2.5 w-24 md:w-36 rounded opacity-70" />
      </div>
      <Skeleton className="h-3 w-10 shrink-0 rounded opacity-60" />
    </div>
  );
}

/**
 * Track list skeleton matching TrackList in ui-components
 */
export function SkeletonTrackList({
  count = 6,
  numbered = true,
  className,
}: {
  count?: number;
  numbered?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col divide-y divide-line/30", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTrackRow key={i} numbered={numbered} />
      ))}
    </div>
  );
}

/**
 * Page header skeleton matching PageHeader in ui-components
 */
export function SkeletonPageHeader({
  hasEyebrow = false,
  hasSubtitle = false,
  hasActions = false,
  className,
}: {
  hasEyebrow?: boolean;
  hasSubtitle?: boolean;
  hasActions?: boolean;
  className?: string;
}) {
  return (
    <header className={cn("mb-6 flex items-end justify-between gap-4 md:mb-8", className)}>
      <div className="flex min-w-0 flex-1 flex-col">
        {hasEyebrow && (
          <Skeleton className="mb-2 h-3 w-24 uppercase rounded opacity-75" />
        )}
        <Skeleton className="h-8 md:h-10 w-44 md:w-64 rounded-[var(--radius-sm)]" />
        {hasSubtitle && (
          <Skeleton className="mt-2 h-3.5 w-36 md:w-48 rounded opacity-80" />
        )}
      </div>
      {hasActions && (
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      )}
    </header>
  );
}

/**
 * Collection header skeleton matching CollectionHeader in ui-components
 */
export function SkeletonCollectionHeader({
  tall = false,
  className,
}: {
  tall?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end",
        className
      )}
    >
      <Skeleton
        className={cn(
          "shrink-0 shadow-lg",
          tall
            ? "w-40 md:w-48 aspect-[3/4] rounded-[var(--radius-xl)]"
            : "size-44 md:size-52 rounded-[var(--radius-2xl)]"
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col justify-end">
        <Skeleton className="mb-2 h-3 w-28 uppercase rounded opacity-75" />
        <Skeleton className="mb-3 h-8 md:h-12 w-3/4 max-w-md rounded-[var(--radius-md)]" />
        <Skeleton className="mb-5 h-3.5 w-48 rounded opacity-75" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="size-10 rounded-full opacity-80" />
          <Skeleton className="size-10 rounded-full opacity-80" />
        </div>
      </div>
    </div>
  );
}

/**
 * Section container skeleton matching Section in ui-components
 */
export function SkeletonSection({
  title = true,
  children,
  className,
}: {
  title?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-9 md:mb-11", className)}>
      {title && (
        <div className="mb-3.5 flex items-center justify-between">
          <Skeleton className="h-5 w-32 md:w-44 rounded" />
          <Skeleton className="h-3 w-14 rounded opacity-60" />
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Grid layout skeleton matching Grid in ui-components
 */
export function SkeletonGrid({
  count = 8,
  min = 160,
  renderItem,
  className,
}: {
  count?: number;
  min?: number;
  renderItem?: (index: number) => ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("grid gap-4", className)}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) =>
        renderItem ? (
          renderItem(i)
        ) : (
          <SkeletonMediaCard key={i} />
        )
      )}
    </div>
  );
}

/**
 * Horizontal shelf skeleton matching Shelf in ui-components
 */
export function SkeletonShelf({
  count = 6,
  renderItem,
  className,
}: {
  count?: number;
  renderItem?: (index: number) => ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "scrollbar-none -mx-4 flex gap-4 overflow-x-hidden px-4 md:-mx-8 md:px-8",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-36 shrink-0 md:w-44">
          {renderItem ? renderItem(i) : <SkeletonMediaCard />}
        </div>
      ))}
    </div>
  );
}

/**
 * Proactive agent recommendation banner skeleton on HomeView
 */
export function SkeletonAgentBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mb-9 overflow-hidden rounded-[var(--radius-2xl)] bg-surface-2 p-6 md:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-lg flex-1 flex-col gap-2.5">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-7 md:h-9 w-3/4 rounded-[var(--radius-sm)]" />
          <Skeleton className="h-3.5 w-1/2 rounded" />
        </div>
        <Skeleton className="size-12 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Search bar skeleton matching SearchView input
 */
export function SkeletonSearchBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 -mx-4 mb-6 px-4 pb-2 md:-mx-8 md:px-8",
        className
      )}
    >
      <div className="glass flex h-14 items-center gap-3 rounded-full px-5">
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-44 rounded" />
      </div>
      <div className="mt-3 flex gap-2 overflow-hidden py-1">
        {['w-14', 'w-16', 'w-20', 'w-16', 'w-24', 'w-18'].map((w, i) => (
          <Skeleton key={i} className={cn("h-8 shrink-0 rounded-full", w)} />
        ))}
      </div>
    </div>
  );
}

/**
 * Settings grouped card skeleton matching SettingsView
 */
export function SkeletonSettingsGroup({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("mb-7", className)}>
      <Skeleton className="mb-2 ml-4 h-3 w-28 uppercase rounded opacity-60" />
      <div className="card divide-y divide-line overflow-hidden rounded-[var(--radius-xl)] bg-surface">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3.5">
              <Skeleton className="size-9 rounded-[var(--radius-md)]" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-32 md:w-44 rounded" />
                <Skeleton className="h-2.5 w-48 md:w-64 rounded opacity-60" />
              </div>
            </div>
            <Skeleton className="h-6 w-11 rounded-full opacity-70" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Video hero player skeleton matching VideoView
 */
export function SkeletonVideoHero({ className }: { className?: string }) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4", className)}>
      <Skeleton className="aspect-video w-full rounded-[var(--radius-2xl)]" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 md:h-8 w-2/3 rounded-[var(--radius-sm)]" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3.5 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
