"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { fetchExams } from "@/lib/exams-api";
import type { ExamSummary } from "@/types/exam";

export default function StudentDashboardPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Could not fetch exam list",
        );
      });
  }, []);

  return (
    <AuthGuard allowedRoles={["STUDENT"]}>
      <AppShell
        title="Student Dashboard"
        links={[{ href: "/student/dashboard", label: "Available Exams" }]}
      >
        <div className="rounded-xl border border-[var(--color-outline-variant)]/10 bg-white">
          <div className="border-b border-[var(--color-outline-variant)]/10 px-6 py-4">
            <h2 className="text-base font-semibold text-[var(--color-on-surface)]">
              Assigned Exams
            </h2>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              Select an exam to enter the arena and start answering
            </p>
          </div>
          {error ? (
            <p className="p-6 text-sm text-[var(--color-error)]">{error}</p>
          ) : exams.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-on-surface-variant)]">
              No exam has been published for you yet.
            </p>
          ) : (
            <div className="divide-y divide-[var(--color-outline-variant)]/10">
              {exams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-[var(--color-on-surface)]">
                      {exam.title}
                    </p>
                    <p className="text-sm text-[var(--color-on-surface-variant)]">
                      {exam.durationMin} min &middot; Starts{" "}
                      {new Date(exam.startTime).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                    href={`/student/exam/${exam.id}`}
                  >
                    Enter exam →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
