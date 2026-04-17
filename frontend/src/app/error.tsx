"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12">
      <Card title="Something went wrong" subtitle="An unexpected error occurred">
        <p className="text-sm text-[var(--color-text-muted)]">
          {error.message || "Please try again or contact support."}
        </p>
        <div className="mt-5">
          <Button onClick={reset}>Try again</Button>
        </div>
      </Card>
    </main>
  );
}
