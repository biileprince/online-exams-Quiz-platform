"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white shadow-[0_12px_30px_rgba(216,119,48,0.28)] hover:brightness-110",
  secondary:
    "bg-[var(--color-panel)] text-[var(--color-text-strong)] border border-[var(--color-border)] hover:bg-[var(--color-panel-2)]",
  danger: "bg-[#c53a3a] text-white hover:bg-[#a42f2f]",
  ghost: "bg-transparent text-[var(--color-text)] hover:bg-white/45",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
