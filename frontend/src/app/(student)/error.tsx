"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StudentError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("[StudentError]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg items-center px-4">
      <Card title="Exam Error" subtitle="Something went wrong">
        <p className="text-sm text-[var(--color-text-muted)]">
          {error.message || "An unexpected error occurred. Your answers are safe."}
        </p>
        <div className="mt-5">
          <Button onClick={reset}>Retry</Button>
        </div>
      </Card>
    </div>
  );
}
