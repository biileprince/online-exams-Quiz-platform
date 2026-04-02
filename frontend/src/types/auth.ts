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

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
}
