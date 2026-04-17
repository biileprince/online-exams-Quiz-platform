import { NextResponse } from "next/server";
import { backendRequest, relayBackendResponse } from "@/lib/server-backend";

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const backendResponse = await backendRequest("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return relayBackendResponse(backendResponse);
}
