export interface ExamSummary {
  id: string;
  title: string;
  durationMin: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  creator: {
    name: string;
    email: string;
  };
}

export interface CreateExamPayload {
  title: string;
  description?: string;
  durationMin: number;
  startTime: string;
  endTime: string;
  password?: string;
}

export interface Question {
  id: string;
  examId: string;
  type: "MCQ" | "FILL_IN_BLANK" | "DRAG_DROP" | "SEQUENCING" | "MATCHING";
  content: string;
  metadata: unknown;
  correctAnswer: unknown;
  marks: number;
}

export interface CreateQuestionPayload {
  examId: string;
  type: Question["type"];
  content: string;
  metadata: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  marks: number;
}

export interface SaveAnswerPayload {
  examId: string;
  questionId: string;
  answer: unknown;
}
