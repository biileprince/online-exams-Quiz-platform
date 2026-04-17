import { NextResponse } from "next/server";
import {
  backendRequestWithAuth,
  finalizeAuthenticatedResponse,
} from "@/lib/server-backend";

interface UploadStudentsRouteContext {
  params: Promise<{ examId: string }>;
}

export async function POST(
  request: Request,
  context: UploadStudentsRouteContext,
): Promise<NextResponse> {
  const { examId } = await context.params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid multipart payload" },
      { status: 400 },
    );
  }

  const result = await backendRequestWithAuth(
    `/exams/${examId}/upload-students`,
    {
      method: "POST",
      body: formData,
    },
  );

  return finalizeAuthenticatedResponse(result);
}
