// MANDATORY COMPONENT CONTRACT: src/components/ui/telemetry-sparkline.tsx
"use client";

import React, { useId, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { Badge } from "@/components/ui/badge-avatar";
import { cn } from "@/lib/utils";

export type SparklineIntent = "monochrome" | "success" | "danger" | "info";

export interface SparklineProps extends React.SVGAttributes<SVGSVGElement> {
  /** Array of numeric data points (minimum 2 points) */
  data: readonly number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  intent?: SparklineIntent;
  /** Renders a subtle vertical area gradient under the stroke path */
  showArea?: boolean;
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  strokeWidth = 1.5,
  intent = "monochrome",
  showArea = true,
  className,
  ...props
}: SparklineProps) {
  const gradientId = useId();

  const strokeColor = {
    monochrome: "var(--ink-primary)",
    success: "var(--status-success-dot)",
    danger: "var(--status-danger-dot)",
    info: "var(--status-info-dot)",
  }[intent];

  const { linePath, areaPath, lastPoint } = useMemo(() => {
    if (!data || data.length < 2) {
      return { linePath: "", areaPath: "", lastPoint: null };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;
    const pad = strokeWidth + 2;
    const innerW = width - pad * 2;
    const innerH = height - pad * 2;

    const points = data.map((val, idx) => {
      const x = pad + (idx / (data.length - 1)) * innerW;
      const y = pad + innerH - ((val - min) / range) * innerH;
      return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
    });

    const line = points
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
      .join(" ");

    const first = points[0];
    const last = points[points.length - 1];
    if (!first || !last) {
      return { linePath: "", areaPath: "", lastPoint: null };
    }
    const area = `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;

    return { linePath: line, areaPath: area, lastPoint: last };
  }, [data, width, height, strokeWidth]);

  if (!data || data.length < 2) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="none"
      aria-hidden="true"
      data-slot="sparkline"
      className={cn("overflow-visible shrink-0 select-none", className)}
      {...props}
    >
      {showArea && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.16" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
      )}

      {showArea && <path d={areaPath} fill={`url(#${gradientId})`} />}

      <path
        d={linePath}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={2.25}
          fill={strokeColor}
          className=" ring-2 ring-surface"
        />
      )}
    </svg>
  );
}

/* ==========================================================================
   TELEMETRY KPI METRIC CARD
   ========================================================================== */
export interface TelemetryMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
    /** Set false if upward trend is negative (e.g., error rate or latency) */
    positiveIsGood?: boolean;
  };
  sparklineData?: readonly number[];
  footnote?: string;
  className?: string;
}

export function TelemetryMetricCard({
  label,
  value,
  unit,
  delta,
  sparklineData,
  footnote,
  className,
}: TelemetryMetricCardProps) {
  const positiveIsGood = delta?.positiveIsGood ?? true;

  const badgeVariant = !delta || delta.trend === "neutral"
    ? "default"
    : (delta.trend === "up" && positiveIsGood) ||
        (delta.trend === "down" && !positiveIsGood)
      ? "success"
      : "danger";

  const sparklineIntent: SparklineIntent =
    badgeVariant === "success"
      ? "success"
      : badgeVariant === "danger"
        ? "danger"
        : "monochrome";

  return (
    <BentoCard padding="default" className={cn("gap-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="type-caption font-medium text-ink-secondary truncate">
          {label}
        </span>
        {delta && (
          <Badge variant={badgeVariant} size="sm" className="gap-0.5">
            {delta.trend === "up" && <ArrowUpRight className="size-3" />}
            {delta.trend === "down" && <ArrowDownRight className="size-3" />}
            {delta.trend === "neutral" && <Minus className="size-3" />}
            <span>{delta.value}</span>
          </Badge>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span
            data-numeric="true"
            className="tabular-data type-display-lg font-semibold tracking-tight text-ink truncate"
          >
            {value}
          </span>
          {unit && (
            <span className="type-caption font-mono text-ink-tertiary">
              {unit}
            </span>
          )}
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <Sparkline
            data={sparklineData}
            intent={sparklineIntent}
            width={96}
            height={32}
          />
        )}
      </div>

      {footnote && (
        <div className="pt-2 border-t border-hairline-subtle">
          <p className="type-micro text-ink-tertiary truncate">{footnote}</p>
        </div>
      )}
    </BentoCard>
  );
}

export const TelemetrySparkline = Sparkline;

