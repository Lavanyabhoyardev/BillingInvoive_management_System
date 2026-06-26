import Link from "next/link";
import { Boxes, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Boxes className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t find the page you were looking for.
        </p>
      </div>
      <Button asChild>
        <Link href={ROUTES.dashboard}>
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
