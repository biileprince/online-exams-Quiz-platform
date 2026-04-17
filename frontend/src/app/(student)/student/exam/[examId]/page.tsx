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
import { AuthGuard } from "@/components/auth-guard";
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

const SAVE_LABELS: Record<SaveStatus["status"], { label: string; color: string }> = {
  idle: { label: "", color: "" },
  queued: { label: "Queued", color: "text-[var(--color-outline)]" },
  saving: { label: "Saving…", color: "text-[var(--color-primary)]" },
  saved: { label: "Saved", color: "text-[var(--color-success)]" },
  error: { label: "Retry failed", color: "text-[var(--color-error)]" },
};

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
        if (settled) return;
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
          if (settled) return;
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
    if (!connected) return;
    Object.entries(pendingAnswersRef.current).forEach(
      ([questionId, answer]) => {
        attemptSave(questionId, answer);
      },
    );
  }, [connected, attemptSave]);

  const formattedTimer = useMemo(() => {
    if (remainingSeconds === null) return "--:--:--";
    const hrs = Math.floor(remainingSeconds / 3600);
    const mins = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  const answeredCount = Object.keys(answers).filter(
    (qId) => answers[qId]?.trim(),
  ).length;

  const saveAnswer = (questionId: string, answer: string) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    queueSave(questionId, answer);
  };

  return (
    <AuthGuard allowedRoles={["STUDENT"]}>
      <div className="min-h-screen">
        {/* Fixed header */}
        <header className="sticky top-0 z-50 border-b border-[var(--color-outline-variant)]/15 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-8">
            <div className="flex items-center gap-6">
              <span className="text-xl font-bold tracking-tighter text-[var(--color-on-surface)]">
                ExamPlatform
              </span>
              <div className="h-6 w-px bg-[var(--color-outline-variant)]/30" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)]">
                  Active Session
                </span>
                <span className="text-sm font-semibold text-[var(--color-on-surface)]">
                  Exam Arena
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--color-primary)]/10 bg-[var(--color-surface-container-high)] px-4 py-2">
                <span className="font-mono text-lg font-bold tracking-tight text-[var(--color-primary)]">
                  {formattedTimer}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${connected ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]"}`}
                />
                <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">
                  {connected ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar — Question Navigator */}
          <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-72 flex-col border-r border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container)] p-6 lg:flex">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Question Navigator
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const isAnswered = Boolean(answers[q.id]?.trim());
                  return (
                    <button
                      key={q.id}
                      onClick={() =>
                        document
                          .getElementById(`question-${q.id}`)
                          ?.scrollIntoView({ behavior: "smooth", block: "center" })
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        isAnswered
                          ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                          : "border border-[var(--color-outline-variant)]/30 bg-white text-[var(--color-on-surface-variant)] hover:bg-white/80"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-auto border-t border-[var(--color-outline-variant)]/10 pt-4">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                <span>Progress</span>
                <span>
                  {Math.round(
                    (answeredCount / Math.max(questions.length, 1)) * 100,
                  )}
                  % ({answeredCount}/{questions.length})
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-container-high)]">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all"
                  style={{
                    width: `${(answeredCount / Math.max(questions.length, 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--color-on-surface-variant)]">
                  <div className="h-3 w-3 rounded bg-[var(--color-primary)]" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--color-on-surface-variant)]">
                  <div className="h-3 w-3 rounded border border-[var(--color-outline-variant)]/30 bg-white" />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8 md:p-12">
            <div className="mx-auto max-w-3xl space-y-12">
              {questions.length === 0 ? (
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  No questions loaded for this exam.
                </p>
              ) : (
                questions.map((question, index) => {
                  const status = saveStatuses[question.id] ?? "idle";
                  const statusInfo = SAVE_LABELS[status];

                  return (
                    <div
                      key={question.id}
                      id={`question-${question.id}`}
                      className="space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <span className="rounded bg-[var(--color-surface-container-high)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                          QUESTION {index + 1}
                        </span>
                        {statusInfo.label ? (
                          <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        ) : null}
                      </div>
                      <div className="rounded-xl border border-[var(--color-outline-variant)]/5 bg-white p-8">
                        <p className="text-lg font-medium leading-relaxed text-[var(--color-on-surface)]">
                          {question.content}
                        </p>
                        <textarea
                          className="mt-6 min-h-24 w-full rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)] p-4 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                          value={answers[question.id] ?? ""}
                          onChange={(event) =>
                            saveAnswer(question.id, event.target.value)
                          }
                          placeholder="Type your answer…"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function StudentExamArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-outline-variant)] border-t-[var(--color-primary)]" />
        </div>
      }
    >
      <StudentExamArenaPageContent />
    </Suspense>
  );
}
