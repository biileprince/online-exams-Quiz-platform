"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12">
      <Card
        title="Welcome back"
        subtitle="Sign in to continue to your exam workspace"
        className="w-full"
      >
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
          {error ? <p className="text-sm text-[#b55050]">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-[var(--color-text-muted)]">
          Need an account?{" "}
          <Link href="/register" className="text-[var(--color-info)]">
            Create one
          </Link>
        </p>
      </Card>
    </main>
  );
}
