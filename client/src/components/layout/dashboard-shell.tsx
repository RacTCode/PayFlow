"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] =
    useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() =>
          setMobileNavOpen(false)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          onMenuClick={() =>
            setMobileNavOpen(true)
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}