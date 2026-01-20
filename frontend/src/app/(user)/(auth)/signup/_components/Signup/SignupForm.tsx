import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { signup } from "@/services/auth/signup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      const inputData = { email, password, confirmPassword };
      await signup(inputData);
      router.push("/login");
      toast.success("Click link in your email and login again.", {
        duration: 5000,
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            placeholder="Enter your password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>

        <Field>
          <Button disabled={isLoading} type="button" onClick={handleSignup}>
            Create Account
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button disabled={isLoading} variant="outline" type="button">
            <FcGoogle />
            Sign up with Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/login">Login</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
