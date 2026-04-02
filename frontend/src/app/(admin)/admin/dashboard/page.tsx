"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { fetchExams } from "@/lib/exams-api";
import type { ExamSummary } from "@/types/exam";

export default function AdminDashboardPage() {
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
        setError(err instanceof Error ? err.message : "Unable to fetch exams");
      });
  }, [accessToken]);

  return (
    <AuthGuard allowedRoles={["ADMIN", "LECTURER"]}>
      <AppShell
        title="Lecturer Dashboard"
        links={[
          { href: "/admin/dashboard", label: "Overview" },
          { href: "/admin/exams/create", label: "Create Exam" },
        ]}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card title="Quick Actions" subtitle="Create and manage assessments">
            <div className="space-y-2 text-sm">
              <p>Create and publish exams with dynamic question structures.</p>
              <Link href="/admin/exams/create" className="text-[var(--color-info)]">
                Start a new exam
              </Link>
            </div>
          </Card>

          <Card title="Live Catalog" subtitle="Most recent exams">
            {error ? (
              <p className="text-sm text-[#b55050]">{error}</p>
            ) : exams.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No exams available yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {exams.slice(0, 6).map((exam) => (
                  <li key={exam.id} className="rounded-lg bg-white/70 p-3">
                    <p className="font-semibold text-[var(--color-text-strong)]">{exam.title}</p>
                    <p className="text-[var(--color-text-muted)]">{exam.durationMin} minutes</p>
                    <Link
                      href={`/admin/exams/${exam.id}/manage`}
                      className="text-[var(--color-info)]"
                    >
                      Manage exam
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
