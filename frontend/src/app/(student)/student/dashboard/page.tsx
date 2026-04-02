"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { fetchExams } from "@/lib/exams-api";
import type { ExamSummary } from "@/types/exam";

export default function StudentDashboardPage() {
  const { accessToken } = useAuth();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetchExams(accessToken)
      .then(setExams)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Could not fetch exam list",
        );
      });
  }, [accessToken]);

  return (
    <AuthGuard allowedRoles={["STUDENT"]}>
      <AppShell
        title="Student Dashboard"
        links={[{ href: "/student/dashboard", label: "Available Exams" }]}
      >
        <Card
          title="Assigned Exams"
          subtitle="Enter the arena and start answering"
        >
          {error ? <p className="text-sm text-[#b55050]">{error}</p> : null}
          {exams.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No exam has been published for you yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {exams.map((exam) => (
                <li key={exam.id} className="rounded-xl bg-white/65 p-4">
                  <p className="font-semibold text-[var(--color-text-strong)]">
                    {exam.title}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Duration: {exam.durationMin} minutes
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Starts: {new Date(exam.startTime).toLocaleString()}
                  </p>
                  <Link
                    className="mt-2 inline-block text-sm font-medium text-[var(--color-info)]"
                    href={`/student/exam/${exam.id}`}
                  >
                    Enter exam arena
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </AppShell>
    </AuthGuard>
  );
}
