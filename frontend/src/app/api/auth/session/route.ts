import { NextResponse } from "next/server";
import {
  backendRequestWithAuth,
  finalizeAuthenticatedResponse,
  setAuthCookies,
} from "@/lib/server-backend";
import type { AuthUser } from "@/types/auth";

export async function GET(): Promise<NextResponse> {
  const result = await backendRequestWithAuth("/auth/me");

  if (!result.response.ok) {
    return finalizeAuthenticatedResponse(result);
  }

  const user = (await result.response.json()) as AuthUser;
  const response = NextResponse.json({ user });

  if (result.rotatedTokens) {
    setAuthCookies(response, result.rotatedTokens);
  }

  return response;
}
