"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { CompanyBadge } from "./company-badge";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

/** Slide-in navigation drawer for tablet/mobile. */
export function MobileNav({ open, onClose }: MobileNavProps) {
  // Lock body scroll while open.
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="absolute left-0 top-0 flex h-full w-72 flex-col border-r bg-card"
          >
            <div className="flex h-16 items-center justify-between border-b px-5">
              <Brand />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarNav onNavigate={onClose} />
            </div>
            <div className="border-t p-3">
              <CompanyBadge />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
