"use client";

import * as React from "react";
import { Cloud, CloudOff, LogOut } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { stopSync } from "@/lib/supabase";

/** Cloud sync status + account controls (only meaningful when configured). */
export function CloudAccount() {
  const { enabled, user, signOut } = useAuth();
  const [busy, setBusy] = React.useState(false);

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CloudOff className="h-4 w-4 text-muted-foreground" />
            Cloud Sync
          </CardTitle>
          <CardDescription>
            Cloud sync is not configured. Your data is stored offline on this
            device only. Add Supabase keys to sync across devices.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      stopSync();
      await signOut();
      toast.success("Signed out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Cloud className="h-4 w-4 text-primary" />
          Cloud Sync
          <Badge variant="success" className="ml-1">
            Active
          </Badge>
        </CardTitle>
        <CardDescription>
          Your data syncs automatically across every device you log in on.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <p className="text-muted-foreground">Signed in as</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} disabled={busy}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
