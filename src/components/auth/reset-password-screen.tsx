"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Boxes, KeyRound, Loader2 } from "lucide-react";
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
import { APP_NAME } from "@/lib/constants";

/** Shown after the user opens a password-reset email link. */
export function ResetPasswordScreen() {
  const { updatePassword, clearRecovery, signOut } = useAuth();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      toast.success("Password updated. You're all set!");
      clearRecovery();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    clearRecovery();
    await signOut();
  }

  return (
    <div
      style={{ minHeight: "100dvh" }}
      className="flex min-h-screen items-center justify-center bg-background px-4 py-8"
    >
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
          <p className="text-sm text-muted-foreground">Set a new password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose a new password</CardTitle>
            <CardDescription>
              Enter and confirm your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="New Password" htmlFor="new-password">
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>
              <FormField label="Confirm Password" htmlFor="confirm-password">
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </FormField>

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Update Password
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm font-medium text-muted-foreground hover:underline"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
