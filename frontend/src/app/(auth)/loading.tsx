export default function AuthLoading() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-info)]" />
        <p className="text-sm text-[var(--color-text-muted)]">Preparing…</p>
      </div>
    </div>
  );
}
