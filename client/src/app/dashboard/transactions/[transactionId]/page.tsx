"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Copy, XCircle } from "lucide-react";

import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

import {
  useTransaction,
  useUpdateTransactionStatus,
} from "@/features/transactions/transactions.hooks";

import type { TransactionStatus } from "@/types/api";

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
  const config = {
    PENDING: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 ring-amber-600/20",
      icon: Clock3,
    },

    SUCCESSFUL: {
      label: "Successful",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      icon: CheckCircle2,
    },

    FAILED: {
      label: "Failed",
      className: "bg-red-50 text-red-700 ring-red-600/20",
      icon: XCircle,
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${current.className}`}
    >
      <Icon className="h-4 w-4" />
      {current.label}
    </span>
  );
}

export default function TransactionDetailsPage() {
  const params = useParams<{
    transactionId: string;
  }>();

  const transactionId = params.transactionId;

  const query = useTransaction(transactionId);

  const statusMutation = useUpdateTransactionStatus();

  if (query.isPending) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />

        <div className="h-80 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8">
        <h2 className="font-semibold text-red-900">Transaction not found</h2>

        <p className="mt-1 text-sm text-red-700">
          We couldn&#39;t load this transaction.
        </p>

        <Link
          href="/dashboard/transactions"
          className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Back to transactions
        </Link>
      </div>
    );
  }

  const transaction = query.data;

  function handleStatusUpdate(status: "SUCCESSFUL" | "FAILED") {
    statusMutation.mutate(
      {
        transactionId: transaction.transactionId,
        status,
      },
      {
        onSuccess: () => {
          if (status === "SUCCESSFUL") {
            toast.success("Payment marked successful", {
              description: "The transaction has been completed successfully.",
            });
          } else {
            toast.error("Payment marked failed", {
              description: "The transaction was marked as unsuccessful.",
            });
          }
        },

        onError: () => {
          toast.error("Unable to update payment", {
            description: "Please try again.",
          });
        },
      },
    );
  }

  async function copyTransactionId() {
    await navigator.clipboard.writeText(transaction.transactionId);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/transactions"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to transactions
      </Link>

      {/* Heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Transaction</p>

          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {transaction.transactionId}
            </h1>

            <button
              type="button"
              onClick={copyTransactionId}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Copy transaction ID"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Created {formatDate(transaction.createdAt)}
          </p>
        </div>

        <StatusBadge status={transaction.status} />
      </section>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaction information */}
        <section className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">Payment details</h2>
          </div>

          <dl className="divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="text-sm text-slate-500">Amount</dt>

              <dd className="font-semibold text-slate-900">
                {formatCurrency(transaction.amount, transaction.currency)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="text-sm text-slate-500">Payment method</dt>

              <dd className="text-sm font-medium text-slate-900">
                {transaction.paymentMethod}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="text-sm text-slate-500">Customer reference</dt>

              <dd className="text-right text-sm font-medium text-slate-900">
                {transaction.customerReference ?? "—"}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="text-sm text-slate-500">Created</dt>

              <dd className="text-sm text-slate-900">
                {formatDate(transaction.createdAt)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="text-sm text-slate-500">Last updated</dt>

              <dd className="text-sm text-slate-900">
                {formatDate(transaction.updatedAt)}
              </dd>
            </div>
          </dl>
        </section>

        {/* QR */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Payment QR</h2>

          <p className="mt-1 text-sm text-slate-500">Payment request payload</p>

          <div className="mt-6 flex items-center justify-center rounded-xl bg-slate-50 p-8">
            {transaction.qrPayload ? (
              <div className="text-center">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <QRCodeSVG
                    value={transaction.qrPayload}
                    size={180}
                    level="M"
                    includeMargin
                  />
                </div>

                <p className="mt-4 break-all text-xs text-slate-400">
                  {transaction.qrPayload}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">QR unavailable</p>
            )}
          </div>
        </section>
      </div>

      {/* Simulation */}
      {transaction.status === "PENDING" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Simulate payment</h2>

          <p className="mt-1 text-sm text-slate-500">
            Simulate the outcome of this payment request. No real payment is
            processed.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={statusMutation.isPending}
              onClick={() => handleStatusUpdate("SUCCESSFUL")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark successful
            </button>

            <button
              type="button"
              disabled={statusMutation.isPending}
              onClick={() => handleStatusUpdate("FAILED")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Mark failed
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
