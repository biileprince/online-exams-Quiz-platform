"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface AuthGuardProps {
  allowedRoles?: Array<"STUDENT" | "LECTURER" | "ADMIN">;
  children: React.ReactNode;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const { isBootstrapping, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles?.length && user && !allowedRoles.includes(user.role)) {
      router.replace(
        user.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard",
      );
    }
  }, [isBootstrapping, isAuthenticated, allowedRoles, user, router]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-outline-variant)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles?.length && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
