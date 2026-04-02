import { apiRequest } from "@/lib/http";
import type {
  CreateExamPayload,
  CreateQuestionPayload,
  ExamSummary,
  Question,
} from "@/types/exam";

export function fetchExams(token: string): Promise<ExamSummary[]> {
  return apiRequest<ExamSummary[]>("/exams", { token });
}

export function fetchExamById(
  token: string,
  examId: string,
): Promise<ExamSummary> {
  return apiRequest<ExamSummary>(`/exams/${examId}`, { token });
}

export function createExam(
  token: string,
  payload: CreateExamPayload,
): Promise<ExamSummary> {
  return apiRequest<ExamSummary>("/exams", {
    method: "POST",
    token,
    body: payload,
  });
}

export function uploadStudentsFile(
  token: string,
  examId: string,
  file: File,
): Promise<{ message: string; status: string; file: string }> {
  const data = new FormData();
  data.append("file", file);

  return apiRequest<{ message: string; status: string; file: string }>(
    `/exams/${examId}/upload-students`,
    {
      method: "POST",
      token,
      body: data,
      isFormData: true,
    },
  );
}

export function fetchQuestionsByExam(
  token: string,
  examId: string,
): Promise<Question[]> {
  return apiRequest<Question[]>(`/questions/exam/${examId}`, { token });
}

export function createQuestion(
  token: string,
  payload: CreateQuestionPayload,
): Promise<Question> {
  return apiRequest<Question>("/questions", {
    method: "POST",
    token,
    body: payload,
  });
}
