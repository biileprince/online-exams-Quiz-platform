"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from "@/lib/auth-api";
import { clearAuthState, loadAuthState, saveAuthState } from "@/lib/storage";
import type {
  AuthState,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

interface AuthContextValue extends AuthState {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const existing = loadAuthState();
    if (!existing?.accessToken) {
      setIsBootstrapping(false);
      return;
    }

    getCurrentUser(existing.accessToken)
      .then((user) => {
        const nextState = {
          accessToken: existing.accessToken,
          refreshToken: existing.refreshToken,
          user,
        };
        setState(nextState);
        saveAuthState(nextState);
      })
      .catch(() => {
        clearAuthState();
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    const nextState: AuthState = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      user: response.user,
    };
    setState(nextState);
    saveAuthState(nextState);
    return response.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerRequest(payload);
  }, []);

  const logout = useCallback(() => {
    setState(initialState);
    clearAuthState();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isBootstrapping,
      isAuthenticated: Boolean(state.accessToken && state.user),
      login,
      register,
      logout,
    }),
    [state, isBootstrapping, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth(): {
  accessToken: string;
  user: AuthUser;
} {
  const auth = useAuth();
  if (!auth.accessToken || !auth.user) {
    throw new Error("User is not authenticated");
  }

  return {
    accessToken: auth.accessToken,
    user: auth.user,
  };
}
