"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface AppShellProps {
  title: string;
  children: React.ReactNode;
  links: Array<{ href: Route; label: string }>;
}

export function AppShell({ title, children, links }: AppShellProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-white/70 p-5 shadow-[0_20px_40px_rgba(12,38,58,0.08)] backdrop-blur-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Online Exam Platform
          </p>
          <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
            {title}
          </h1>
          {user ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Signed in as {user.name} ({user.role})
            </p>
          ) : null}
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Sign out
        </Button>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              pathname === link.href
                ? "bg-[var(--color-info)] text-white"
                : "bg-white/55 text-[var(--color-text)] hover:bg-white",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
