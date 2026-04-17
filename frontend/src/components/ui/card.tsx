import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-xl bg-[var(--color-surface-lowest)] border border-[var(--color-outline-variant)]/10 p-6",
        className,
      )}
    >
      {title ? (
        <header className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              {subtitle}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
