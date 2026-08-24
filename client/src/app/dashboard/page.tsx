"use client";

import {
  Clock3,
  CircleCheck,
  CircleX,
  Wallet,
} from "lucide-react";

import { useDashboardStats } from "@/features/dashboard/dashboard.hooks";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

function formatCurrency(
  amount: number,
  currency = "INR",
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-4 w-4 text-slate-700" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const dashboardQuery = useDashboardStats();

  if (dashboardQuery.isPending) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-medium text-red-900">
          Unable to load dashboard
        </h2>

        <p className="mt-1 text-sm text-red-700">
          Please refresh the page and try again.
        </p>

        <button
          type="button"
          onClick={() => dashboardQuery.refetch()}
          className="mt-4 rounded-lg bg-red-900 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const stats = dashboardQuery.data;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-slate-500">
          Overview
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Payment activity
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here&#39;s an overview of your merchant activity.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total volume"
          value={formatCurrency(Number(stats.totalVolume))}
          description={`${stats.totalTransactions} total transactions`}
          icon={Wallet}
        />

        <StatCard
          title="Successful"
          value={String(stats.successfulTransactions)}
          description="Completed payments"
          icon={CircleCheck}
        />

        <StatCard
          title="Pending"
          value={String(stats.pendingTransactions)}
          description="Awaiting payment"
          icon={Clock3}
        />

        <StatCard
          title="Failed"
          value={String(stats.failedTransactions)}
          description="Unsuccessful payments"
          icon={CircleX}
        />
      </section>

      <RecentTransactions />
    </div>
  );
}