"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2";

import { cn } from "./utils";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  variant?: "default" | "success" | "warning" | "destructive";
}

function Progress({
  className,
  value,
  variant = "default",
  ...props
}: ProgressProps) {
  const variantClasses = {
    default: "bg-[var(--accent)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    destructive: "bg-[var(--destructive)]",
  };

  const backgroundClasses = {
    default: "bg-[var(--accent)]/20",
    success: "bg-[var(--success)]/20",
    warning: "bg-[var(--warning)]/20",
    destructive: "bg-[var(--destructive)]/20",
  };

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        backgroundClasses[variant],
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all",
          variantClasses[variant]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
