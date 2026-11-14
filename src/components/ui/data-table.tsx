// MANDATORY COMPONENT CONTRACT: src/components/ui/data-table.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Enforces 36px ultra-dense telemetry rows instead of 44px standard rows */
  density?: "compact" | "default";
  /** Wraps table in a 1px structural hairline rounded container */
  framed?: boolean;
  containerClassName?: string;
  ref?: React.Ref<HTMLTableElement>;
}

export function Table({
  className,
  containerClassName,
  density = "default",
  framed = true,
  ref,
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-density={density}
      className={cn(
        "group/table relative w-full overflow-x-auto overscroll-x-contain",
        framed && "rounded-xl bg-surface border border-hairline shadow-ambient-xs",
        containerClassName
      )}
    >
      <table
        ref={ref}
        data-slot="table"
        className={cn(
          "w-full caption-bottom border-collapse text-start type-body-sm text-ink",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>;
}) {
  return (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn(
        "sticky top-0 z-10 bg-glass backdrop-blur-md border-b border-hairline select-none",
        className
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>;
}) {
  return (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn(
        "divide-y divide-hairline-subtle [&_tr:last-child]:border-0",
        className
      )}
      {...props}
    />
  );
}

export function TableRow({
  className,
  isSelected = false,
  interactive = true,
  ref,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  isSelected?: boolean;
  interactive?: boolean;
  ref?: React.Ref<HTMLTableRowElement>;
}) {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      data-state={isSelected ? "selected" : undefined}
      className={cn(
        "group/row transition-colors duration-100",
        interactive && "hover:bg-surface-hover",
        "data-[state=selected]:bg-surface-active",
        className
      )}
      {...props}
    />
  );
}

export interface TableHeadProps
  extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: "start" | "center" | "end";
  ref?: React.Ref<HTMLTableCellElement>;
}

export function TableHead({
  className,
  align = "start",
  ref,
  ...props
}: TableHeadProps) {
  const alignClass = {
    start: "text-start",
    center: "text-center",
    end: "text-end",
  }[align];

  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn(
        "h-8 px-3.5 align-middle type-micro uppercase text-ink-tertiary font-medium whitespace-nowrap",
        "first:ps-4 last:pe-4",
        alignClass,
        className
      )}
      {...props}
    />
  );
}

export interface TableCellProps
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: "start" | "center" | "end";
  /** Enforces tabular numerals and monospace font for numbers, IDs, and metrics */
  numeric?: boolean;
  /** Fades cell content to secondary/tertiary ink for metadata columns */
  muted?: boolean;
  ref?: React.Ref<HTMLTableCellElement>;
}

export function TableCell({
  className,
  align = "start",
  numeric = false,
  muted = false,
  ref,
  ...props
}: TableCellProps) {
  const alignClass = {
    start: "text-start",
    center: "text-center",
    end: "text-end",
  }[align];

  return (
    <td
      ref={ref}
      data-slot="table-cell"
      data-numeric={numeric ? "true" : undefined}
      className={cn(
        "px-3.5 align-middle whitespace-nowrap",
        "h-11 group-data-[density=compact]/table:h-8",
        "first:ps-4 last:pe-4",
        alignClass,
        numeric && "tabular-data font-mono type-caption",
        muted ? "text-ink-secondary" : "text-ink",
        className
      )}
      {...props}
    />
  );
}
