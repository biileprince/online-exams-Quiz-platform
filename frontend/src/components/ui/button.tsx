"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90 active:scale-[0.98]",
  secondary:
    "border border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]",
  danger:
    "bg-[var(--color-error)] text-white hover:opacity-90",
  ghost:
    "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
