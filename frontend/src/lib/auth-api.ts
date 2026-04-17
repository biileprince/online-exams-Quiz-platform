import { apiRequest } from "@/lib/http";
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  SessionResponse,
  SocketTokenResponse,
} from "@/types/auth";

export function register(payload: RegisterPayload): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentSession(): Promise<SessionResponse> {
  return apiRequest<SessionResponse>("/auth/session");
}

export function logout(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export function getSocketToken(): Promise<SocketTokenResponse> {
  return apiRequest<SocketTokenResponse>("/auth/socket-token");
}
