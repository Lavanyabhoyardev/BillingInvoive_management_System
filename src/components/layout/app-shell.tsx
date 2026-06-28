"use client";

import * as React from "react";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

/** Top-level application chrome: sidebar + header + scrollable content area. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    // `100dvh` (with `h-screen` as fallback) keeps the layout sized to the
    // VISIBLE viewport on mobile, so the bottom of the page / action bars are
    // never hidden behind the browser's address bar.
    <div
      style={{ height: "100dvh" }}
      className="flex h-screen overflow-hidden bg-background"
    >
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
