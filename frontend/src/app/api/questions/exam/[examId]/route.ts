import { NextResponse } from "next/server";
import {
  backendRequestWithAuth,
  finalizeAuthenticatedResponse,
} from "@/lib/server-backend";

interface QuestionsExamRouteContext {
  params: Promise<{ examId: string }>;
}

export async function GET(
  _request: Request,
  context: QuestionsExamRouteContext,
): Promise<NextResponse> {
  const { examId } = await context.params;
  const result = await backendRequestWithAuth(`/questions/exam/${examId}`);
  return finalizeAuthenticatedResponse(result);
}
