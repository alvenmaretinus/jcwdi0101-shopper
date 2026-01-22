"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import z from "zod";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async () => {
    if (cooldown > 0) return;

    const res = z.email().safeParse(email);
    if (!res.success) {
      toast.error("Invalid email");
      return;
    }
    setIsSubmitting(true);
    setCooldown(60);

    intervalRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    toast.success("Reset link sent successfully!");
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-2xl">🥬</span>
            </div>
            <span className="text-xl font-bold text-foreground">FreshMart</span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Reset your password
          </h1>
          <p className="text-muted-foreground mb-8">
            Enter your email and we'll send you a link to reset your password
          </p>

          <form className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={cooldown > 0 || isSubmitting}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Send Reset Link"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login in
          </Link>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary to-fresh-green-dark items-center justify-center p-12">
        <div className="text-center text-primary-foreground">
          <div className="text-[150px] mb-8 animate-float">🔐</div>
          <h2 className="text-3xl font-bold mb-4">Forgot Password?</h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            No worries! It happens to the best of us. We'll help you get back
            into your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
