"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        <div className="grid gap-5 lg:grid-cols-2">
          <Card
            title="Question Builder"
            subtitle="Use JSON metadata for dynamic question logic"
          >
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

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-[var(--color-text-strong)]">
                  Question type
                </span>
                <select
                  value={questionDraft.type}
                  onChange={(event) =>
                    setQuestionDraft((current) => ({
                      ...current,
                      type: event.target.value as CreateQuestionPayload["type"],
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm"
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

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-[var(--color-text-strong)]">
                  Metadata JSON
                </span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-[var(--color-border)] bg-white p-3 text-sm"
                  value={JSON.stringify(questionDraft.metadata, null, 2)}
                  onChange={(event) => {
                    try {
                      const metadata = JSON.parse(event.target.value) as Record<
                        string,
                        unknown
                      >;
                      setQuestionDraft((current) => ({ ...current, metadata }));
                      setLoadError(null);
                    } catch {
                      setLoadError("Metadata must be valid JSON");
                    }
                  }}
                />
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-[var(--color-text-strong)]">
                  Correct answer JSON
                </span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-[var(--color-border)] bg-white p-3 text-sm"
                  value={JSON.stringify(questionDraft.correctAnswer, null, 2)}
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
          </Card>

          <Card
            title="Bulk Student Upload"
            subtitle="Queue Excel processing on the backend"
          >
            <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-white/70 p-4">
              <h3 className="text-base font-semibold text-[var(--color-text-strong)]">
                Live Invigilation
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Socket: {connected ? "connected" : "offline"}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Students online: {onlineStudents.length}
              </p>

              {onlineStudents.length > 0 ? (
                <ul className="mt-3 space-y-1 text-xs text-[var(--color-text-muted)]">
                  {onlineStudents.slice(0, 6).map((userId) => (
                    <li key={userId}>Online: {userId}</li>
                  ))}
                </ul>
              ) : null}

              {focusAlerts.length > 0 ? (
                <ul className="mt-3 space-y-1 text-xs text-[#b55050]">
                  {focusAlerts.map((alert, index) => (
                    <li key={`${alert.userId}-${alert.at}-${index}`}>
                      Focus loss: {alert.userId} at{" "}
                      {new Date(alert.at).toLocaleTimeString()}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="file"
                name="students-file"
                accept=".xlsx,.xls,.csv"
                className="block w-full rounded-xl border border-[var(--color-border)] bg-white p-3 text-sm"
              />
              <Button type="submit" className="w-full">
                Upload students file
              </Button>
              {uploadMessage ? (
                <p className="text-sm text-[#2a7b56]">{uploadMessage}</p>
              ) : null}
              {uploadError ? (
                <p className="text-sm text-[#b55050]">{uploadError}</p>
              ) : null}
            </form>

            <div className="mt-6 border-t border-[var(--color-border)] pt-5">
              <h3 className="text-base font-semibold text-[var(--color-text-strong)]">
                Current Questions
              </h3>
              {loadError ? (
                <p className="mt-2 text-sm text-[#b55050]">{loadError}</p>
              ) : questions.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  No questions added yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {questions.map((question, index) => (
                    <li
                      key={question.id}
                      className="rounded-lg bg-white/65 p-3"
                    >
                      <p className="font-semibold text-[var(--color-text-strong)]">
                        Q{index + 1}: {question.type}
                      </p>
                      <p className="text-[var(--color-text)]">
                        {question.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

export default function ManageExamPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-[var(--color-text-muted)]">
          Loading exam...
        </div>
      }
    >
      <ManageExamPageContent />
    </Suspense>
  );
}
