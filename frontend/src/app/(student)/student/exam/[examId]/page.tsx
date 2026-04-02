"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useSocket } from "@/contexts/socket-context";
import { fetchQuestionsByExam } from "@/lib/exams-api";
import type { Question } from "@/types/exam";

interface SaveStatus {
  questionId: string;
  status: "idle" | "saving" | "saved" | "error";
}

function StudentExamArenaPageContent() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;
  const { accessToken } = useAuth();
  const { socket, connected } = useSocket();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatuses, setSaveStatuses] = useState<
    Record<string, SaveStatus["status"]>
  >({});
  const [remainingSeconds, setRemainingSeconds] = useState(60 * 60);

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetchQuestionsByExam(accessToken, examId)
      .then(setQuestions)
      .catch(() => setQuestions([]));
  }, [accessToken, examId]);

  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    socket.emit("join_exam", { examId });

    const onVisibilityChange = () => {
      socket.emit("heartbeat", { examId, focus: !document.hidden });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    heartbeatIntervalRef.current = setInterval(() => {
      socket.emit("heartbeat", { examId, focus: !document.hidden });
    }, 10000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [socket, connected, examId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  const saveAnswer = (questionId: string, answer: string) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    setSaveStatuses((current) => ({ ...current, [questionId]: "saving" }));

    socket?.emit(
      "save_answer",
      { examId, questionId, answer },
      (ack: { status: string }) => {
        setSaveStatuses((current) => ({
          ...current,
          [questionId]: ack?.status === "saved" ? "saved" : "error",
        }));
      },
    );
  };

  return (
    <AuthGuard allowedRoles={["STUDENT"]}>
      <AppShell
        title="Exam Arena"
        links={[{ href: "/student/dashboard", label: "Back to dashboard" }]}
      >
        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
          <Card title="Live Session" subtitle="Socket and anti-cheat status">
            <p className="text-sm">
              Socket connection:{" "}
              <strong>{connected ? "Online" : "Offline"}</strong>
            </p>
            <p className="mt-2 text-sm">
              Local countdown: <strong>{formattedTimer}</strong>
            </p>
          </Card>

          <Card
            title="Questions"
            subtitle="Every answer is persisted immediately"
          >
            {questions.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                No questions loaded for this exam.
              </p>
            ) : (
              <ul className="space-y-4">
                {questions.map((question, index) => (
                  <li
                    key={question.id}
                    className="rounded-xl border border-[var(--color-border)] bg-white/75 p-4"
                  >
                    <p className="font-semibold text-[var(--color-text-strong)]">
                      {index + 1}. {question.content}
                    </p>
                    <textarea
                      className="mt-3 min-h-24 w-full rounded-xl border border-[var(--color-border)] p-3 text-sm"
                      value={answers[question.id] ?? ""}
                      onChange={(event) =>
                        saveAnswer(question.id, event.target.value)
                      }
                      placeholder="Type your answer..."
                    />
                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      Auto-save: {saveStatuses[question.id] ?? "idle"}
                    </p>
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

export default function StudentExamArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-[var(--color-text-muted)]">
          Loading exam...
        </div>
      }
    >
      <StudentExamArenaPageContent />
    </Suspense>
  );
}
