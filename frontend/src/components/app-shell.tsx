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
    <div className="min-h-screen">
      {/* Fixed top bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-outline-variant)]/15 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold tracking-tighter text-[var(--color-on-surface)]">
              ExamPlatform
            </span>
            <div className="hidden h-6 w-px bg-[var(--color-outline-variant)]/30 sm:block" />
            <div className="hidden flex-col sm:flex">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)]">
                Dashboard
              </span>
              <span className="text-sm font-semibold text-[var(--color-on-surface)]">
                {title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <span className="hidden text-sm text-[var(--color-on-surface-variant)] sm:inline">
                {user.name}
                <span className="ml-1 rounded bg-[var(--color-surface-container-high)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </span>
            ) : null}
            <Button variant="ghost" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Sub-navigation */}
      <nav className="border-b border-[var(--color-outline-variant)]/10 bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-screen-2xl gap-1 px-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-screen-2xl px-8 py-8">
        {children}
      </main>
    </div>
  );
}
