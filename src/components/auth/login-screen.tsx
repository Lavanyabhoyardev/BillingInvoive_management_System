"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Boxes, Loader2, LogIn, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { useAuth } from "@/components/providers/auth-provider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

type Mode = "signin" | "signup" | "forgot";

/** Email + password sign-in / sign-up / forgot-password gate. */
export function LoginScreen() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "forgot") {
      if (!email.trim()) {
        toast.error("Enter your email to receive a reset link.");
        return;
      }
      setBusy(true);
      try {
        await sendPasswordReset(email.trim());
        toast.success("Password reset link sent. Check your email inbox.");
        setMode("signin");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not send email.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!email.trim() || password.length < 6) {
      toast.error("Enter a valid email and a password (min 6 chars).");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        toast.success(
          "Account created. If email confirmation is on, check your inbox."
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signin"
      ? "Sign in"
      : mode === "signup"
        ? "Create account"
        : "Reset password";

  const description =
    mode === "forgot"
      ? "Enter your email and we'll send you a reset link."
      : "Your data syncs securely across all your devices.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Boxes className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-bold">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              {mode !== "forgot" && (
                <FormField label="Password" htmlFor="password">
                  <Input
                    id="password"
                    type="password"
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormField>
              )}

              {mode === "signin" && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "signin" ? (
                  <LogIn className="h-4 w-4" />
                ) : mode === "signup" ? (
                  <UserPlus className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "forgot" ? (
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Back to sign in
                </button>
              ) : (
                <>
                  {mode === "signin"
                    ? "New here? "
                    : "Already have an account? "}
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() =>
                      setMode(mode === "signin" ? "signup" : "signin")
                    }
                  >
                    {mode === "signin" ? "Create an account" : "Sign in"}
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
