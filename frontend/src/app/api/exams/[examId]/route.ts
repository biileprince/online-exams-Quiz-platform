import { NextResponse } from "next/server";
import {
  backendRequestWithAuth,
  finalizeAuthenticatedResponse,
} from "@/lib/server-backend";

interface ExamRouteContext {
  params: Promise<{ examId: string }>;
}

export async function GET(
  _request: Request,
  context: ExamRouteContext,
): Promise<NextResponse> {
  const { examId } = await context.params;
  const result = await backendRequestWithAuth(`/exams/${examId}`);
  return finalizeAuthenticatedResponse(result);
}
