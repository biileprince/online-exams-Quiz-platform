import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-12 sm:px-6">
      <Card
        title="Online Exam Platform"
        subtitle="Real-time assessment workflows for lecturers and students"
        className="w-full"
      >
        <p className="max-w-2xl text-sm leading-7 text-[var(--color-text)]">
          Build exams, bulk upload participants, and capture every answer in
          real-time through Socket.IO. Use role-aware dashboards to manage
          lecturer and student experiences.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary">Create account</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
