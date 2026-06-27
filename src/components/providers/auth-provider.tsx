"use client";

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthContextValue {
  /** True when cloud sync is configured (env vars present). */
  enabled: boolean;
  /** Still determining session state. */
  loading: boolean;
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * Provides Supabase auth state. When Supabase is not configured, it reports
 * `enabled: false` and the app runs in offline-only mode.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(isSupabaseConfigured);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      enabled: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      async signIn(email, password) {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      },
      async signUp(email, password) {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      },
      async signOut() {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      },
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
