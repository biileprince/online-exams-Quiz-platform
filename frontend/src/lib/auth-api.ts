import { apiRequest } from "@/lib/http";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export function register(payload: RegisterPayload): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUser(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", {
    token,
  });
}
