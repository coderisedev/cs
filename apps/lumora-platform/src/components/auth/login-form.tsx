"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const errors = state?.error as Record<string, string[]> | undefined;

  return (
    <div className="space-y-4">
      {urlError === "auth_failed" && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          Authentication failed. Please try again.
        </div>
      )}

      {errors?._form && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errors._form[0]}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            autoComplete="email"
          />
          {errors?.email && (
            <p className="text-sm text-destructive">{errors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          {errors?.password && (
            <p className="text-sm text-destructive">{errors.password[0]}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <form action={async () => { await signInWithGoogle(); }}>
        <Button variant="outline" className="w-full">
          Sign in with Google
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-primary underline underline-offset-4">
          Create one
        </a>
      </p>
    </div>
  );
}
