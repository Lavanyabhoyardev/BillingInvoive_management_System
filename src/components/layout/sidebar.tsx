"use client";

import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { CompanyBadge } from "./company-badge";

/** Fixed desktop sidebar. */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
      <div className="border-t p-3">
        <CompanyBadge />
      </div>
    </aside>
  );
}
