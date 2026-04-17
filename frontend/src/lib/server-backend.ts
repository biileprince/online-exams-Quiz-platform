import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AuthResponse } from "@/types/auth";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

export const ACCESS_TOKEN_COOKIE = "online_exam_access_token";
export const REFRESH_TOKEN_COOKIE = "online_exam_refresh_token";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

interface CookieTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface RotatedTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthenticatedBackendResult {
  response: Response;
  accessToken: string | null;
  rotatedTokens: RotatedTokens | null;
}

export async function backendRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${BACKEND_API_URL}${path}`, {
    ...init,
    cache: "no-store",
  });
}

export async function readAuthCookies(): Promise<CookieTokens> {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

export function setAuthCookies(response: NextResponse, tokens: RotatedTokens): void {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function withAuthHeader(headers: HeadersInit | undefined, accessToken: string): Headers {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  return nextHeaders;
}

async function refreshTokens(refreshToken: string): Promise<RotatedTokens | null> {
  const refreshResponse = await backendRequest("/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const payload = (await refreshResponse.json()) as RotatedTokens;
  if (!payload.access_token || !payload.refresh_token) {
    return null;
  }

  return payload;
}

export async function backendRequestWithAuth(
  path: string,
  init: RequestInit = {},
): Promise<AuthenticatedBackendResult> {
  const { accessToken: cookieAccessToken, refreshToken } = await readAuthCookies();

  let accessToken = cookieAccessToken;
  let rotatedTokens: RotatedTokens | null = null;

  if (!accessToken && refreshToken) {
    rotatedTokens = await refreshTokens(refreshToken);
    accessToken = rotatedTokens?.access_token ?? null;
  }

  if (!accessToken) {
    return {
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      accessToken: null,
      rotatedTokens,
    };
  }

  let response = await backendRequest(path, {
    ...init,
    headers: withAuthHeader(init.headers, accessToken),
  });

  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed) {
      rotatedTokens = refreshed;
      accessToken = refreshed.access_token;
      response = await backendRequest(path, {
        ...init,
        headers: withAuthHeader(init.headers, accessToken),
      });
    }
  }

  return {
    response,
    accessToken,
    rotatedTokens,
  };
}

export async function relayBackendResponse(source: Response): Promise<NextResponse> {
  if (source.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = source.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = (await source.json().catch(() => ({
      message: source.statusText || "Request failed",
    }))) as unknown;

    return NextResponse.json(payload, { status: source.status });
  }

  const text = await source.text();
  return new NextResponse(text, {
    status: source.status,
    headers: contentType
      ? {
          "Content-Type": contentType,
        }
      : undefined,
  });
}

export async function finalizeAuthenticatedResponse(
  result: AuthenticatedBackendResult,
): Promise<NextResponse> {
  if (result.response.status === 401) {
    const unauthorized = NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
    clearAuthCookies(unauthorized);
    return unauthorized;
  }

  const response = await relayBackendResponse(result.response);
  if (result.rotatedTokens) {
    setAuthCookies(response, result.rotatedTokens);
  }

  return response;
}

export function pickAuthTokens(payload: AuthResponse): RotatedTokens {
  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  };
}
