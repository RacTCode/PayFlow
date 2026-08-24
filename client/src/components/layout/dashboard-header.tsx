"use client";

import { Menu } from "lucide-react";

import { useCurrentUser } from "@/features/auth/auth.hooks";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {
  const { data: user } = useCurrentUser();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-slate-900">
            Merchant Dashboard
          </h2>

          <p className="hidden text-xs text-slate-500 sm:block">
            Monitor and manage your payment activity.
          </p>
        </div>
      </div>

      {user && (
        <div className="ml-4 flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">
              {user.name}
            </p>

            <p className="text-xs text-slate-500">
              {user.email}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
}