"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { Card } from "@/components/ui/card";
import { useSocket } from "@/contexts/socket-context";
import { fetchQuestionsByExam } from "@/lib/exams-api";
import type { Question } from "@/types/exam";

interface SaveStatus {
  status: "idle" | "queued" | "saving" | "saved" | "error";
}

interface JoinExamAck {
  status?: string;
  remainingSeconds?: number;
}

interface TimerSyncPayload {
  examId?: string;
  remainingSeconds?: number;
}

const SAVE_DEBOUNCE_MS = 350;
const SAVE_ACK_TIMEOUT_MS = 2500;
const MAX_SAVE_RETRIES = 3;

function StudentExamArenaPageContent() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;
  const { socket, connected } = useSocket();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatuses, setSaveStatuses] = useState<
    Record<string, SaveStatus["status"]>
  >({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const pendingAnswersRef = useRef<Record<string, string>>({});

  useEffect(() => {
    fetchQuestionsByExam(examId)
      .then(setQuestions)
      .catch(() => setQuestions([]));
  }, [examId]);

  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    socket.emit("join_exam", { examId }, (ack?: JoinExamAck) => {
      if (typeof ack?.remainingSeconds === "number") {
        setRemainingSeconds(ack.remainingSeconds);
      }
    });

    const handleTimerSync = (payload: TimerSyncPayload) => {
      if (typeof payload.remainingSeconds === "number") {
        setRemainingSeconds(payload.remainingSeconds);
      }
    };

    socket.on("timer_sync", handleTimerSync);

    const onVisibilityChange = () => {
      socket.emit("heartbeat", { examId, focus: !document.hidden });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    heartbeatIntervalRef.current = setInterval(() => {
      socket.emit("heartbeat", { examId, focus: !document.hidden });
    }, 10000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      socket.off("timer_sync", handleTimerSync);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [socket, connected, examId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current === null) {
          return current;
        }

        return current > 0 ? current - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(saveTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  const attemptSave = useCallback(
    (questionId: string, answer: string, attempt = 0) => {
      if (!socket || !connected) {
        pendingAnswersRef.current[questionId] = answer;
        setSaveStatuses((current) => ({ ...current, [questionId]: "queued" }));
        return;
      }

      setSaveStatuses((current) => ({ ...current, [questionId]: "saving" }));

      let settled = false;
      const timeoutId = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        const nextAttempt = attempt + 1;
        if (nextAttempt > MAX_SAVE_RETRIES) {
          pendingAnswersRef.current[questionId] = answer;
          setSaveStatuses((current) => ({ ...current, [questionId]: "error" }));
          return;
        }

        setSaveStatuses((current) => ({ ...current, [questionId]: "queued" }));
        attemptSave(questionId, answer, nextAttempt);
      }, SAVE_ACK_TIMEOUT_MS);

      socket.emit(
        "save_answer",
        { examId, questionId, answer },
        (ack?: { status?: string }) => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timeoutId);

          if (ack?.status === "saved") {
            delete pendingAnswersRef.current[questionId];
            setSaveStatuses((current) => ({
              ...current,
              [questionId]: "saved",
            }));
            return;
          }

          const nextAttempt = attempt + 1;
          if (nextAttempt > MAX_SAVE_RETRIES) {
            pendingAnswersRef.current[questionId] = answer;
            setSaveStatuses((current) => ({
              ...current,
              [questionId]: "error",
            }));
            return;
          }

          setSaveStatuses((current) => ({
            ...current,
            [questionId]: "queued",
          }));
          attemptSave(questionId, answer, nextAttempt);
        },
      );
    },
    [socket, connected, examId],
  );

  const queueSave = useCallback(
    (questionId: string, answer: string) => {
      pendingAnswersRef.current[questionId] = answer;
      setSaveStatuses((current) => ({ ...current, [questionId]: "queued" }));

      if (saveTimeoutsRef.current[questionId]) {
        clearTimeout(saveTimeoutsRef.current[questionId]);
      }

      saveTimeoutsRef.current[questionId] = setTimeout(() => {
        const pendingAnswer = pendingAnswersRef.current[questionId] ?? answer;
        attemptSave(questionId, pendingAnswer);
      }, SAVE_DEBOUNCE_MS);
    },
    [attemptSave],
  );

  useEffect(() => {
    if (!connected) {
      return;
    }

    Object.entries(pendingAnswersRef.current).forEach(
      ([questionId, answer]) => {
        attemptSave(questionId, answer);
      },
    );
  }, [connected, attemptSave]);

  const formattedTimer = useMemo(() => {
    if (remainingSeconds === null) {
      return "--:--";
    }

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  const saveAnswer = (questionId: string, answer: string) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    queueSave(questionId, answer);
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
