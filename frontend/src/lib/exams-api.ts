import { apiRequest } from "@/lib/http";
import type {
  CreateExamPayload,
  CreateQuestionPayload,
  ExamSummary,
  Question,
} from "@/types/exam";

export function fetchExams(): Promise<ExamSummary[]> {
  return apiRequest<ExamSummary[]>("/exams");
}

export function fetchExamById(examId: string): Promise<ExamSummary> {
  return apiRequest<ExamSummary>(`/exams/${examId}`);
}

export function createExam(payload: CreateExamPayload): Promise<ExamSummary> {
  return apiRequest<ExamSummary>("/exams", {
    method: "POST",
    body: payload,
  });
}

export function uploadStudentsFile(
  examId: string,
  file: File,
): Promise<{ message: string; status: string; file: string }> {
  const data = new FormData();
  data.append("file", file);

  return apiRequest<{ message: string; status: string; file: string }>(
    `/exams/${examId}/upload-students`,
    {
      method: "POST",
      body: data,
      isFormData: true,
    },
  );
}

export function fetchQuestionsByExam(examId: string): Promise<Question[]> {
  return apiRequest<Question[]>(`/questions/exam/${examId}`);
}

export function createQuestion(
  payload: CreateQuestionPayload,
): Promise<Question> {
  return apiRequest<Question>("/questions", {
    method: "POST",
    body: payload,
  });
}
