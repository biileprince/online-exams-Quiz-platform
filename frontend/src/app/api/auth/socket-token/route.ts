import { NextResponse } from "next/server";
import {
  backendRequestWithAuth,
  finalizeAuthenticatedResponse,
  setAuthCookies,
} from "@/lib/server-backend";

export async function GET(): Promise<NextResponse> {
  const result = await backendRequestWithAuth("/auth/me");

  if (!result.response.ok || !result.accessToken) {
    return finalizeAuthenticatedResponse(result);
  }

  const response = NextResponse.json({ token: result.accessToken });
  if (result.rotatedTokens) {
    setAuthCookies(response, result.rotatedTokens);
  }

  return response;
}
