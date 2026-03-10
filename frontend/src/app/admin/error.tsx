"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <div className="mb-2 inline-flex items-center justify-center justify-self-center rounded-full bg-muted p-3">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred while loading this section. Try again or
            return to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => reset()}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
