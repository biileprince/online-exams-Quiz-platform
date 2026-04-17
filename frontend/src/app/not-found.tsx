import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-8">
      <div className="max-w-sm text-center">
        <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
          The page you requested does not exist.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button variant="secondary">Go home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
