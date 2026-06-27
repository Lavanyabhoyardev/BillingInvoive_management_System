"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Boxes, Loader2, LogIn, UserPlus } from "lucide-react";
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

/** Email + password sign-in / sign-up gate shown when not logged in. */
export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            <CardTitle>
              {mode === "signin" ? "Sign in" : "Create account"}
            </CardTitle>
            <CardDescription>
              Your data syncs securely across all your devices.
            </CardDescription>
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

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "signin" ? (
                  <LogIn className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New here? " : "Already have an account? "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() =>
                  setMode(mode === "signin" ? "signup" : "signin")
                }
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
