"use client";

import { useActionState, useState } from "react";
import { signUp, signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, null);
  const [password, setPassword] = useState("");

  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains lowercase", met: /[a-z]/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
  ];

  const errors = state?.error as Record<string, string[]> | undefined;

  return (
    <div className="space-y-4">
      {errors?._form && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errors._form[0]}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="Your full name"
            required
            autoComplete="name"
          />
          {errors?.fullName && (
            <p className="text-sm text-destructive">{errors.fullName[0]}</p>
          )}
        </div>

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
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors?.password && (
            <p className="text-sm text-destructive">{errors.password[0]}</p>
          )}
          <ul className="mt-2 space-y-1">
            {checks.map((check) => (
              <li
                key={check.label}
                className={`text-xs flex items-center gap-1.5 ${
                  check.met ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {check.met ? "✓" : "○"} {check.label}
              </li>
            ))}
          </ul>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create Account"}
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
        Already have an account?{" "}
        <a href="/login" className="text-primary underline underline-offset-4">
          Sign in
        </a>
      </p>
    </div>
  );
}
