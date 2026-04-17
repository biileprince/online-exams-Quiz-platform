export type UserRole = "STUDENT" | "LECTURER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  indexNumber?: string;
  course?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface SessionResponse {
  user: AuthUser;
}

export interface SocketTokenResponse {
  token: string;
}

export interface AuthState {
  user: AuthUser | null;
}
