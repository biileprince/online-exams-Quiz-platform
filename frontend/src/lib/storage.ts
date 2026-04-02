import type { AuthState } from "@/types/auth";

const AUTH_KEY = "online_exam_auth";

export function saveAuthState(authState: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
}

export function loadAuthState(): AuthState | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function clearAuthState(): void {
  localStorage.removeItem(AUTH_KEY);
}
