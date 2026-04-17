"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { createExam } from "@/lib/exams-api";

export default function CreateExamPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMin, setDurationMin] = useState(60);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const exam = await createExam({
        title,
        description: description || undefined,
        durationMin,
        startTime,
        endTime,
        password: password || undefined,
      });
      router.replace(`/admin/exams/${exam.id}/manage`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create exam");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["ADMIN", "LECTURER"]}>
      <AppShell
        title="Create Exam"
        links={[
          { href: "/admin/dashboard", label: "Dashboard" },
          { href: "/admin/exams/create", label: "Create" },
        ]}
      >
        <div className="max-w-2xl rounded-xl border border-[var(--color-outline-variant)]/10 bg-white p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">
              Exam Details
            </h2>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              Define schedule and access policy
            </p>
          </div>

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <InputField
              label="Exam title"
              className="sm:col-span-2"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-[var(--color-on-surface)]">
                Description
              </span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)] p-3 text-sm text-[var(--color-on-surface)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mid-semester exam instructions"
              />
            </label>

            <InputField
              label="Duration (minutes)"
              type="number"
              min={1}
              value={durationMin}
              onChange={(event) => setDurationMin(Number(event.target.value))}
              required
            />

            <InputField
              label="Exam password (optional)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <InputField
              label="Start time"
              type="datetime-local"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
            />

            <InputField
              label="End time"
              type="datetime-local"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
            />

            {error ? (
              <p className="text-sm text-[var(--color-error)] sm:col-span-2">{error}</p>
            ) : null}
            <Button type="submit" className="sm:col-span-2" disabled={saving}>
              {saving ? "Creating exam…" : "Create and continue"}
            </Button>
          </form>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
