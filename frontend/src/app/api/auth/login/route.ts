import { NextResponse } from "next/server";
import {
  backendRequest,
  pickAuthTokens,
  relayBackendResponse,
  setAuthCookies,
} from "@/lib/server-backend";
import type { AuthResponse } from "@/types/auth";

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const backendResponse = await backendRequest("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!backendResponse.ok) {
    return relayBackendResponse(backendResponse);
  }

  const authResponse = (await backendResponse.json()) as AuthResponse;
  const response = NextResponse.json({
    user: authResponse.user,
  });

  setAuthCookies(response, pickAuthTokens(authResponse));
  return response;
}
