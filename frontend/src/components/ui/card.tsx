import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(145deg,var(--color-panel),var(--color-panel-2))] p-6 shadow-[0_25px_55px_rgba(12,38,58,0.12)] backdrop-blur-sm",
        className,
      )}
    >
      <header className="mb-5">
        <h2 className="text-xl font-semibold text-[var(--color-text-strong)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {subtitle}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
