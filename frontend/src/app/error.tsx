"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-8">
      <div className="max-w-sm text-center">
        <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="mt-6">
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </main>
  );
}
