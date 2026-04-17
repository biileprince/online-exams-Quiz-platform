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
  getCurrentSession,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/lib/auth-api";
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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const initialState: AuthState = {
  user: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    getCurrentSession()
      .then(({ user }) => {
        setState({ user });
      })
      .catch(() => {
        setState(initialState);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    const nextState: AuthState = { user: response.user };
    setState(nextState);
    return response.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerRequest(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setState(initialState);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isBootstrapping,
      isAuthenticated: Boolean(state.user),
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
  user: AuthUser;
} {
  const auth = useAuth();
  if (!auth.user) {
    throw new Error("User is not authenticated");
  }

  return {
    user: auth.user,
  };
}
