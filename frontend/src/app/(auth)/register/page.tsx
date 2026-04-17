"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/http";
import type { UserRole } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [indexNumber, setIndexNumber] = useState("");
  const [course, setCourse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({
        name,
        email,
        password,
        role,
        indexNumber: indexNumber || undefined,
        course: course || undefined,
      });
      router.replace("/login");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Registration failed";
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
            Join the platform<br />in seconds.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Register as a lecturer to create exams, or as a student to start
            taking them immediately.
          </p>
        </div>
        <p className="text-xs text-white/40">
          © 2026 Online Exam Platform
        </p>
      </div>

      {/* Right — Form */}
      <main className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">
              Create account
            </h1>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              Set up your role and profile details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="sm:col-span-2"
            />
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="sm:col-span-2"
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
              className="sm:col-span-2"
            />

            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-[var(--color-on-surface)]">
                Role
              </span>
              <select
                className="h-11 w-full rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)] px-3 text-sm text-[var(--color-on-surface)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                <option value="STUDENT">Student</option>
                <option value="LECTURER">Lecturer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>

            {role === "STUDENT" ? (
              <>
                <InputField
                  label="Index number"
                  value={indexNumber}
                  onChange={(event) => setIndexNumber(event.target.value)}
                />
                <InputField
                  label="Course"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                />
              </>
            ) : null}

            {error ? (
              <p className="text-sm text-[var(--color-error)] sm:col-span-2">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="sm:col-span-2" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-[var(--color-on-surface-variant)]">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
