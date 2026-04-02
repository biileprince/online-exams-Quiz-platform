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
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 text-[var(--color-text)]">
        Loading session...
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
