import { AppShell } from "@/components/layout/app-shell";

/** Shared chrome for all primary application pages. */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
