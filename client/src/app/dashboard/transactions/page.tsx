"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { useTransactions } from "@/features/transactions/transactions.hooks";

import type { TransactionStatus } from "@/types/api";

const statusOptions: Array<TransactionStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "SUCCESSFUL",
  "FAILED",
];

function formatCurrency(amount: string, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
    SUCCESSFUL: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    FAILED: "bg-red-50 text-red-700 ring-red-600/20",
  };

  const labels = {
    PENDING: "Pending",
    SUCCESSFUL: "Successful",
    FAILED: "Failed",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TransactionStatus | "ALL">("ALL");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);

  const query = useTransactions({
    search: search || undefined,
    status,
    from: from || undefined,
    to: to || undefined,
    page,
    limit: 20,
  });

  const transactions = query.data?.transactions ?? [];

  const pagination = query.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Payments</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Transactions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Search and manage your payment activity.
          </p>
        </div>

        <Link
          href="/dashboard/payments/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create payment
        </Link>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search transaction ID or customer reference..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as TransactionStatus | "ALL");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="ALL">All statuses</option>

            <option value="PENDING">Pending</option>

            <option value="SUCCESSFUL">Successful</option>

            <option value="FAILED">Failed</option>
          </select>

          {/* Clear filters */}
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("ALL");
              setFrom("");
              setTo("");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear filters
          </button>
        </div>

        {/* Date filters */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="from"
              className="mb-1.5 block text-xs font-medium text-slate-500"
            >
              From date
            </label>

            <input
              id="from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="to"
              className="mb-1.5 block text-xs font-medium text-slate-500"
            >
              To date
            </label>

            <input
              id="to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {query.isPending ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        ) : query.isError ? (
          <div className="p-10 text-center">
            <p className="font-medium text-red-900">
              Unable to load transactions
            </p>

            <p className="mt-1 text-sm text-red-600">Please try again.</p>

            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-slate-900">No transactions found</p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Transaction
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/transactions/${transaction.transactionId}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {transaction.transactionId}
                        </Link>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {transaction.paymentMethod}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {transaction.customerReference ?? "—"}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency,
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={transaction.status} />
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {transactions.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/dashboard/transactions/${transaction.transactionId}`}
                  className="block p-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {transaction.transactionId}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {transaction.customerReference ??
                          "No customer reference"}
                      </p>
                    </div>

                    <StatusBadge status={transaction.status} />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>

                    <p className="text-xs text-slate-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    className="rounded-lg border border-slate-300 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() =>
                      setPage((value) =>
                        Math.min(pagination.totalPages, value + 1),
                      )
                    }
                    className="rounded-lg border border-slate-300 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
