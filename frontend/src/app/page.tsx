import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-outline-variant)]/15 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-8">
          <span className="text-xl font-bold tracking-tighter text-[var(--color-on-surface)]">
            ExamPlatform
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-screen-xl px-8">
        <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
          <span className="mb-4 rounded-full bg-[var(--color-primary-container)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-on-primary-container)]">
            Secure &middot; Real-time &middot; Reliable
          </span>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-[var(--color-on-surface)] sm:text-6xl">
            Modern exam delivery for universities
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-on-surface-variant)]">
            Build exams, onboard students in bulk, and capture every answer in
            real-time. Live monitoring and anti-cheat safeguards built in.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button className="h-12 px-8 text-base">Create an account</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="h-12 px-8 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <section className="border-t border-[var(--color-outline-variant)]/10 py-24">
          <div className="grid gap-12 sm:grid-cols-3">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-container)]">
                <svg className="h-5 w-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" /></svg>
              </div>
              <h3 className="text-base font-semibold text-[var(--color-on-surface)]">
                Server-synced timers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
                Countdowns are authoritative from the server. Students cannot manipulate time by adjusting their local clock.
              </p>
            </div>
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-container)]">
                <svg className="h-5 w-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-base font-semibold text-[var(--color-on-surface)]">
                Anti-cheat monitoring
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
                Heartbeat tracking detects tab-switching and focus loss, alerting invigilators instantly via WebSocket events.
              </p>
            </div>
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-container)]">
                <svg className="h-5 w-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-base font-semibold text-[var(--color-on-surface)]">
                Auto-save answers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
                Every keystroke is debounced and persisted via Socket.IO with retry logic. No work is ever lost.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-outline-variant)]/15 py-8">
        <div className="mx-auto max-w-screen-xl px-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)]">
            © 2026 Online Exam Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
