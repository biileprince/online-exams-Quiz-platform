"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-12">
      <Card
        title="Create account"
        subtitle="Set up your role and profile"
        className="w-full"
      >
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

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-[var(--color-text-strong)]">
              Role
            </span>
            <select
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm"
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
            <p className="text-sm text-[#b55050] sm:col-span-2">{error}</p>
          ) : null}

          <Button type="submit" className="sm:col-span-2" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-[var(--color-text-muted)]">
          Already registered?{" "}
          <Link href="/login" className="text-[var(--color-info)]">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
