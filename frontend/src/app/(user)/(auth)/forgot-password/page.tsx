"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const onSubmit = async () => {
    const result = z.email().safeParse(email);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: authError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (data?.status) {
        toast.success("An email has been sent to you.");
        setIsEmailSent(true);
      }

      if (authError) {
        toast.error(authError.message);
        setIsEmailSent(false);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <Card className="w-full mx-auto my-20 max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            A password reset link has been sent to your email.
          </div>
          <Button onClick={() => router.replace("/login")}>
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mx-auto my-20 max-w-md">
      <CardHeader>
        <CardTitle>Enter your email</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !email || isEmailSent}
          >
            {isSubmitting ? "Sending..." : "Send request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
