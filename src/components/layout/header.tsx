"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { ROUTES } from "@/lib/constants";

/** Top app bar with mobile menu trigger, quick action and theme toggle. */
export function Header() {
  const [navOpen, setNavOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="lg:hidden">
          <Brand />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={ROUTES.newQuotation}>
              <Plus className="h-4 w-4" />
              New Quotation
            </Link>
          </Button>
          <Button asChild size="icon" className="sm:hidden">
            <Link href={ROUTES.newQuotation} aria-label="New quotation">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
