"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserError({ reset }: { reset: () => void }) {
  return (
    <div className="container-app py-16">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          We hit an unexpected error while loading this page. Please try again.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => reset()}>
            Try again
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
