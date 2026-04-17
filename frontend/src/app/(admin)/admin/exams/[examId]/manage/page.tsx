"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useSocket } from "@/contexts/socket-context";
import {
  createQuestion,
  fetchQuestionsByExam,
  uploadStudentsFile,
} from "@/lib/exams-api";
import type { CreateQuestionPayload, Question } from "@/types/exam";

interface FocusAlert {
  userId: string;
  at: string;
}

function ManageExamPageContent() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;
  const { socket, connected } = useSocket();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [onlineStudents, setOnlineStudents] = useState<string[]>([]);
  const [focusAlerts, setFocusAlerts] = useState<FocusAlert[]>([]);
  const [questionDraft, setQuestionDraft] = useState<CreateQuestionPayload>({
    examId,
    type: "MCQ",
    content: "",
    metadata: { options: ["Option A", "Option B"] },
    correctAnswer: { value: "Option A" },
    marks: 1,
  });

  const refreshQuestions = () => {
    fetchQuestionsByExam(examId)
      .then(setQuestions)
      .catch((err) =>
        setLoadError(
          err instanceof Error ? err.message : "Could not load questions",
        ),
      );
  };

  useEffect(() => {
    refreshQuestions();
  }, [examId]);

  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    socket.emit("watch_exam", { examId });

    const onStudentOnline = (payload: { userId?: string }) => {
      const id = payload.userId;
      if (!id) {
        return;
      }

      setOnlineStudents((current) =>
        current.includes(id) ? current : [...current, id],
      );
    };

    const onStudentOffline = (payload: { userId?: string }) => {
      const id = payload.userId;
      if (!id) {
        return;
      }

      setOnlineStudents((current) =>
        current.filter((userId) => userId !== id),
      );
    };

    const onFocusAlert = (payload: { userId?: string; at?: string }) => {
      if (!payload.userId) {
        return;
      }

      const event: FocusAlert = {
        userId: payload.userId,
        at: payload.at ?? new Date().toISOString(),
      };

      setFocusAlerts((current) => [event, ...current].slice(0, 8));
    };

    socket.on("student_online", onStudentOnline);
    socket.on("student_offline", onStudentOffline);
    socket.on("focus_alert", onFocusAlert);

    return () => {
      socket.off("student_online", onStudentOnline);
      socket.off("student_offline", onStudentOffline);
      socket.off("focus_alert", onFocusAlert);
    };
  }, [socket, connected, examId]);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(null);
    setUploadMessage(null);

    const target = event.currentTarget;
    const fileInput = target.elements.namedItem(
      "students-file",
    ) as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) {
      setUploadError("Please choose an Excel file first.");
      return;
    }

    try {
      const response = await uploadStudentsFile(examId, file);
      setUploadMessage(response.message);
      target.reset();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleAddQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadError(null);

    try {
      await createQuestion(questionDraft);
      setQuestionDraft((current) => ({
        ...current,
        content: "",
      }));
      refreshQuestions();
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Question creation failed",
      );
    }
  };

  return (
    <AuthGuard allowedRoles={["ADMIN", "LECTURER"]}>
      <AppShell
        title="Manage Exam"
        links={[
          { href: "/admin/dashboard", label: "Dashboard" },
          { href: "/admin/exams/create", label: "Create Exam" },
        ]}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Question Builder */}
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--color-outline-variant)]/10 bg-white p-6">
              <h2 className="text-base font-semibold text-[var(--color-on-surface)]">
                Question Builder
              </h2>
              <p className="mb-5 text-sm text-[var(--color-on-surface-variant)]">
                Use JSON metadata for dynamic question logic
              </p>

              <form className="space-y-4" onSubmit={handleAddQuestion}>
                <InputField
                  label="Question content"
                  value={questionDraft.content}
                  onChange={(event) =>
                    setQuestionDraft((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  required
                />

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[var(--color-on-surface)]">
                    Question type
                  </span>
                  <select
                    value={questionDraft.type}
                    onChange={(event) =>
                      setQuestionDraft((current) => ({
                        ...current,
                        type: event.target
                          .value as CreateQuestionPayload["type"],
                      }))
                    }
                    className="h-11 w-full rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="FILL_IN_BLANK">Fill in blank</option>
                    <option value="DRAG_DROP">Drag drop</option>
                    <option value="SEQUENCING">Sequencing</option>
                    <option value="MATCHING">Matching</option>
                  </select>
                </label>

                <InputField
                  label="Marks"
                  type="number"
                  min={1}
                  step={1}
                  value={questionDraft.marks}
                  onChange={(event) =>
                    setQuestionDraft((current) => ({
                      ...current,
                      marks: Number(event.target.value),
                    }))
                  }
                />

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[var(--color-on-surface)]">
                    Metadata JSON
                  </span>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)] p-3 font-mono text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                    value={JSON.stringify(questionDraft.metadata, null, 2)}
                    onChange={(event) => {
                      try {
                        const metadata = JSON.parse(
                          event.target.value,
                        ) as Record<string, unknown>;
                        setQuestionDraft((current) => ({
                          ...current,
                          metadata,
                        }));
                        setLoadError(null);
                      } catch {
                        setLoadError("Metadata must be valid JSON");
                      }
                    }}
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[var(--color-on-surface)]">
                    Correct answer JSON
                  </span>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)] p-3 font-mono text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                    value={JSON.stringify(
                      questionDraft.correctAnswer,
                      null,
                      2,
                    )}
                    onChange={(event) => {
                      try {
                        const correctAnswer = JSON.parse(
                          event.target.value,
                        ) as Record<string, unknown>;
                        setQuestionDraft((current) => ({
                          ...current,
                          correctAnswer,
                        }));
                        setLoadError(null);
                      } catch {
                        setLoadError("Correct answer must be valid JSON");
                      }
                    }}
                  />
                </label>

                <Button type="submit" className="w-full">
                  Add question
                </Button>
              </form>
            </div>
          </div>

          {/* Right: Monitoring + Upload + Questions */}
          <div className="space-y-6">
            {/* Live monitoring */}
            <div className="rounded-xl border border-[var(--color-outline-variant)]/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--color-on-surface)]">
                  Live Invigilation
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${connected ? "bg-[var(--color-success)]" : "bg-[var(--color-outline)]"}`}
                  />
                  <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">
                    {connected ? "Connected" : "Offline"}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-[var(--color-on-surface-variant)]">
                Students online: <strong>{onlineStudents.length}</strong>
              </p>

              {onlineStudents.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {onlineStudents.slice(0, 8).map((userId) => (
                    <span
                      key={userId}
                      className="rounded bg-[var(--color-primary-container)] px-2 py-1 text-xs font-medium text-[var(--color-on-primary-container)]"
                    >
                      {userId.slice(0, 8)}…
                    </span>
                  ))}
                </div>
              ) : null}

              {focusAlerts.length > 0 ? (
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-error)]">
                    Focus Alerts
                  </p>
                  {focusAlerts.map((alert, index) => (
                    <p
                      key={`${alert.userId}-${alert.at}-${index}`}
                      className="text-xs text-[var(--color-on-surface-variant)]"
                    >
                      <span className="text-[var(--color-error)]">⚠</span>{" "}
                      {alert.userId.slice(0, 8)}… at{" "}
                      {new Date(alert.at).toLocaleTimeString()}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Bulk upload */}
            <div className="rounded-xl border border-[var(--color-outline-variant)]/10 bg-white p-6">
              <h2 className="text-base font-semibold text-[var(--color-on-surface)]">
                Bulk Student Upload
              </h2>
              <p className="mb-4 text-sm text-[var(--color-on-surface-variant)]">
                Queue Excel processing on the backend
              </p>

              <form onSubmit={handleUpload} className="space-y-3">
                <input
                  type="file"
                  name="students-file"
                  accept=".xlsx,.xls,.csv"
                  className="block w-full rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)] p-3 text-sm"
                />
                <Button type="submit" className="w-full">
                  Upload students file
                </Button>
                {uploadMessage ? (
                  <p className="text-sm text-[var(--color-success)]">{uploadMessage}</p>
                ) : null}
                {uploadError ? (
                  <p className="text-sm text-[var(--color-error)]">{uploadError}</p>
                ) : null}
              </form>
            </div>

            {/* Current questions */}
            <div className="rounded-xl border border-[var(--color-outline-variant)]/10 bg-white p-6">
              <h2 className="text-base font-semibold text-[var(--color-on-surface)]">
                Current Questions
              </h2>
              {loadError ? (
                <p className="mt-3 text-sm text-[var(--color-error)]">{loadError}</p>
              ) : questions.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--color-on-surface-variant)]">
                  No questions added yet.
                </p>
              ) : (
                <div className="mt-3 divide-y divide-[var(--color-outline-variant)]/10">
                  {questions.map((question, index) => (
                    <div key={question.id} className="py-3">
                      <p className="text-sm font-medium text-[var(--color-on-surface)]">
                        Q{index + 1}{" "}
                        <span className="ml-1 rounded bg-[var(--color-surface-container-high)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--color-primary)]">
                          {question.type}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                        {question.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

export default function ManageExamPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-outline-variant)] border-t-[var(--color-primary)]" />
        </div>
      }
    >
      <ManageExamPageContent />
    </Suspense>
  );
}
