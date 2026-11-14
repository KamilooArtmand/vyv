// MANDATORY COMPONENT CONTRACT: src/components/ui/controls.tsx
"use client";

import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ==========================================================================
   1. TACTILE SWITCH (TOGGLE)
   ========================================================================== */
export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  ref?: React.Ref<HTMLButtonElement>;
}

export function Switch({ className, ref, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-pill border border-transparent p-0.5",
        "transition-colors duration-150 ease-[var(--ease-snap)]",
        "argon-focus-ring touch-target-expand",
        "bg-canvas-recessed border-hairline data-[state=checked]:bg-surface-inverted data-[state=checked]:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-pill bg-surface shadow-ambient-sm ring-0",
          "transition-transform duration-150 ease-[var(--ease-optical-out)]",
          "data-[state=unchecked]:translate-x-0",
          "ltr:data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4",
          " dark:data-[state=checked]:bg-canvas"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

/* ==========================================================================
   2. PRECISION CHECKBOX
   ========================================================================== */
export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  ref?: React.Ref<HTMLButtonElement>;
}

export function Checkbox({ className, ref, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "peer inline-flex size-4 shrink-0 items-center justify-center rounded-xs bg-surface",
        "border border-hairline shadow-ambient-xs",
        "transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-snap)]",
        "hover:border-hairline-strong active:scale-90",
        "argon-focus-ring touch-target-expand",
        "data-[state=checked]:bg-surface-inverted data-[state=checked]:border-surface-inverted data-[state=checked]:text-ink-inverted",
        "data-[state=indeterminate]:bg-surface-inverted data-[state=indeterminate]:border-surface-inverted data-[state=indeterminate]:text-ink-inverted",
        "disabled:cursor-not-allowed disabled:opacity-45",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === "indeterminate" ? (
          <Minus className="size-3 stroke-[2.5]" />
        ) : (
          <Check className="size-3 stroke-[2.5]" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/* ==========================================================================
   3. HARDWARE-PRECISION RANGE SLIDER
   ========================================================================== */
export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  ref?: React.Ref<HTMLSpanElement>;
}

export function Slider({ className, ref, ...props }: SliderProps) {
  const initialValues = Array.isArray(props.value)
    ? props.value
    : Array.isArray(props.defaultValue)
      ? props.defaultValue
      : [0];

  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center py-1.5",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-pill bg-canvas-recessed border border-hairline-subtle">
        <SliderPrimitive.Range className="absolute h-full bg-surface-inverted" />
      </SliderPrimitive.Track>
      {initialValues.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cn(
            "block size-3.5 rounded-pill bg-surface border border-hairline-focused shadow-ambient-sm",
            "transition-[transform,box-shadow] duration-150 ease-[var(--ease-optical-out)]",
            "hover:scale-110 active:scale-95",
            "argon-focus-ring cursor-grab active:cursor-grabbing"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}
