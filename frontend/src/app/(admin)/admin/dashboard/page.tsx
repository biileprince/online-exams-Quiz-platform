"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { fetchExams } from "@/lib/exams-api";
import type { ExamSummary } from "@/types/exam";

export default function AdminDashboardPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to fetch exams");
      });
  }, []);

  return (
    <AuthGuard allowedRoles={["ADMIN", "LECTURER"]}>
      <AppShell
        title="Lecturer Dashboard"
        links={[
          { href: "/admin/dashboard", label: "Overview" },
          { href: "/admin/exams/create", label: "Create Exam" },
        ]}
      >
        {/* Stats row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-outline-variant)]/10 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Total Exams
            </p>
            <p className="mt-2 text-3xl font-bold text-[var(--color-on-surface)]">
              {exams.length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-outline-variant)]/10 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Quick Action
            </p>
            <Link href="/admin/exams/create" className="mt-2 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline">
              Create a new exam →
            </Link>
          </div>
          <div className="rounded-xl border border-[var(--color-outline-variant)]/10 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Platform
            </p>
            <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
              Real-time Socket.IO monitoring active
            </p>
          </div>
        </div>

        {/* Exams table */}
        <div className="rounded-xl border border-[var(--color-outline-variant)]/10 bg-white">
          <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/10 px-6 py-4">
            <h2 className="text-base font-semibold text-[var(--color-on-surface)]">
              Exam Catalog
            </h2>
            <Link href="/admin/exams/create">
              <Button className="h-9 px-4 text-xs">+ New exam</Button>
            </Link>
          </div>
          {error ? (
            <p className="p-6 text-sm text-[var(--color-error)]">{error}</p>
          ) : exams.length === 0 ? (
            <p className="p-6 text-sm text-[var(--color-on-surface-variant)]">
              No exams available yet. Create your first exam to get started.
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
                      {new Date(exam.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/admin/exams/${exam.id}/manage`}
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    Manage
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
