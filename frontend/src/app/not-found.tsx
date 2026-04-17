import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12">
      <Card title="Page not found" subtitle="The page you requested does not exist">
        <Link href="/">
          <Button variant="secondary">Go home</Button>
        </Link>
      </Card>
    </main>
  );
}
