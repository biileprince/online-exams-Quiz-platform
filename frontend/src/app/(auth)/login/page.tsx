"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/http";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const authenticatedUser = await login({ email, password });
      router.replace(
        authenticatedUser.role === "STUDENT"
          ? "/student/dashboard"
          : "/admin/dashboard",
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding panel */}
      <div className="hidden w-[480px] flex-col justify-between bg-[var(--color-primary)] p-12 lg:flex">
        <span className="text-xl font-bold tracking-tighter text-white/90">
          ExamPlatform
        </span>
        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            Secure assessments,<br />delivered in real-time.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Role-aware dashboards for lecturers and students with live
            monitoring, auto-save, and anti-cheat safeguards.
          </p>
        </div>
        <p className="text-xs text-white/40">
          © 2026 Online Exam Platform
        </p>
      </div>

      {/* Right — Form */}
      <main className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              Sign in to continue to your exam workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              placeholder="lecturer@university.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error ? (
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-[var(--color-on-surface-variant)]">
            Need an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
