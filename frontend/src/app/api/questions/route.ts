import { NextResponse } from "next/server";
import {
  backendRequestWithAuth,
  finalizeAuthenticatedResponse,
} from "@/lib/server-backend";

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const result = await backendRequestWithAuth("/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return finalizeAuthenticatedResponse(result);
}
