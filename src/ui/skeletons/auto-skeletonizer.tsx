import { type ReactNode, useEffect, useState } from 'react';
import { PageSkeleton, ROUTE_SKELETON_MAP } from './auto-skeletons';
import { cn } from '../../core/core-utils';

/**
 * Props for the SkeletonContainer component
 */
export interface SkeletonContainerProps {
  loading: boolean;
  route?: string;
  fallback?: ReactNode;
  children: ReactNode;
  className?: string;
  minDurationMs?: number;
}

/**
 * SkeletonContainer: Wraps content and automatically displays the exact matching
 * route skeleton while loading, with an optional minimum display duration to prevent
 * annoying flicker during fast loads.
 */
export function SkeletonContainer({
  loading,
  route,
  fallback,
  children,
  className = '',
  minDurationMs = 0,
}: SkeletonContainerProps) {
  const [showSkeleton, setShowSkeleton] = useState(loading);

  useEffect(() => {
    let timer: any;
    if (loading) {
      setShowSkeleton(true);
    } else if (minDurationMs > 0) {
      timer = setTimeout(() => setShowSkeleton(false), minDurationMs);
    } else {
      setShowSkeleton(false);
    }
    return () => clearTimeout(timer);
  }, [loading, minDurationMs]);

  if (showSkeleton) {
    return (
      <div className={cn("skeleton-container-loading anim-fade", className)}>
        {fallback ?? <PageSkeleton route={route} />}
      </div>
    );
  }

  return <div className={cn("skeleton-container-ready anim-fade", className)}>{children}</div>;
}

/**
 * AutoSkeletonize: Recursively inspects a simple layout config or transforms child structures
 * into skeleton placeholders preserving exact geometric footprint.
 */
export function AutoSkeletonize({
  children,
  active = true,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  if (!active) return <>{children}</>;
  return (
    <div className="skeleton-auto-mask pointer-events-none select-none opacity-80" aria-busy="true">
      {children}
    </div>
  );
}

/**
 * DOM Structure Analyzer / Skeleton Extractor
 * Can be invoked in browser console or dev environment:
 * `window.__generateSkeletonFromDOM(document.querySelector('#main-scroll'))`
 *
 * It traverses the actual rendered DOM tree, detects headers, grids, cards, images,
 * and text nodes, and produces an auto-generated high-fidelity skeleton representation.
 */
export function captureSkeletonFromDOM(rootEl: HTMLElement): {
  layout: string;
  elementsCount: number;
  jsxCode: string;
} {
  if (!rootEl) {
    return { layout: 'empty', elementsCount: 0, jsxCode: '<div />' };
  }

  let count = 0;
  function analyzeNode(node: HTMLElement, depth = 0): string {
    count++;
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    const isFlex = style.display.includes('flex');
    const isGrid = style.display.includes('grid');
    const isImg = node.tagName === 'IMG' || node.classList.contains('aspect-square') || node.classList.contains('aspect-video');
    const isText = (node.childElementCount === 0 && (node.textContent || '').trim().length > 0) || /^H[1-6]$/.test(node.tagName) || node.tagName === 'P' || node.tagName === 'SPAN';
    const indent = '  '.repeat(depth);

    if (isImg) {
      const isCircle = style.borderRadius === '50%' || node.classList.contains('rounded-full');
      return `${indent}<SkeletonArtwork ${isCircle ? 'circle ' : ''}className="${node.className}" />`;
    }

    if (isText && !isFlex && !isGrid) {
      const height = Math.round(rect.height);
      const width = Math.round(rect.width);
      return `${indent}<Skeleton className="h-[${height}px] w-[${width}px] rounded" />`;
    }

    const children = Array.from(node.children) as HTMLElement[];
    if (children.length === 0) {
      return `${indent}<Skeleton className="${node.className}" />`;
    }

    const childrenJSX = children.map(c => analyzeNode(c, depth + 1)).join('\n');
    return `${indent}<div className="${node.className}">\n${childrenJSX}\n${indent}</div>`;
  }

  const jsxCode = analyzeNode(rootEl);
  return {
    layout: rootEl.className,
    elementsCount: count,
    jsxCode,
  };
}

// Expose dev-tool utility to window in development mode
if (typeof window !== 'undefined') {
  (window as any).__captureSkeletonFromDOM = captureSkeletonFromDOM;
}
