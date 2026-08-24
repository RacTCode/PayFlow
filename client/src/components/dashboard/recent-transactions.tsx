"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { useTransactions } from "@/features/transactions/transactions.hooks";
import type {
  Transaction,
  TransactionStatus,
} from "@/types/api";

function formatCurrency(
  amount: string,
  currency: string,
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function StatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  const config = {
    PENDING: {
      label: "Pending",
      icon: Clock3,
      className:
        "bg-amber-50 text-amber-700 ring-amber-600/20",
    },

    SUCCESSFUL: {
      label: "Successful",
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    },

    FAILED: {
      label: "Failed",
      icon: XCircle,
      className:
        "bg-red-50 text-red-700 ring-red-600/20",
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${current.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {current.label}
    </span>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: Transaction;
}) {
  return (
    <Link
      href={`/dashboard/transactions/${transaction.transactionId}`}
      className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">
          {transaction.customerReference ||
            transaction.transactionId}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {transaction.transactionId} ·{" "}
          {formatDate(transaction.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="hidden text-sm font-medium text-slate-900 sm:block">
          {formatCurrency(
            transaction.amount,
            transaction.currency,
          )}
        </span>

        <StatusBadge status={transaction.status} />
      </div>
    </Link>
  );
}

function RecentTransactionsSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-6 py-5"
          >
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

              <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>
        ),
      )}
    </div>
  );
}

export function RecentTransactions() {
  const query = useTransactions({
    page: 1,
    limit: 5,
  });

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            Recent transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest payment activity.
          </p>
        </div>

        <Link
          href="/dashboard/transactions"
          className="hidden items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline-flex"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {query.isPending && (
        <RecentTransactionsSkeleton />
      )}

      {query.isError && (
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            Couldn&#39;t load recent transactions.
          </p>

          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-3 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Try again
          </button>
        </div>
      )}

      {query.isSuccess &&
        query.data.transactions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-slate-900">
              No transactions yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Create a payment request to get started.
            </p>

            <Link
              href="/dashboard/payments/create"
              className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create payment
            </Link>
          </div>
        )}

      {query.isSuccess &&
        query.data.transactions.length > 0 && (
          <div className="divide-y divide-slate-100">
            {query.data.transactions.map(
              (transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ),
            )}
          </div>
        )}

      <div className="border-t border-slate-100 px-6 py-4 sm:hidden">
        <Link
          href="/dashboard/transactions"
          className="flex items-center justify-center gap-1 text-sm font-medium text-slate-600"
        >
          View all transactions
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}