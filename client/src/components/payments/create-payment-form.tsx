"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useCreateTransaction } from "@/features/transactions/transactions.hooks";

export function CreatePaymentForm() {
  const router = useRouter();
  const createMutation = useCreateTransaction();

  const [amount, setAmount] = useState("");
  const [customerReference, setCustomerReference] =
    useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return;
    }

    createMutation.mutate(
  {
    amount: numericAmount,
    currency: "INR",
    paymentMethod: "QR",
    customerReference:
      customerReference.trim() || undefined,
  },
  {
    onSuccess: (transaction) => {
      toast.success(
        "Payment request created",
        {
          description:
            "The QR payment request is ready.",
        },
      );

      router.push(
        `/dashboard/transactions/${transaction.transactionId}`,
      );
    },

    onError: () => {
      toast.error(
        "Unable to create payment",
        {
          description:
            "Please check your details and try again.",
        },
      );
    },
  },
);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-slate-700"
        >
          Amount
        </label>

        <div className="relative mt-1.5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            ₹
          </span>

          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="customerReference"
          className="block text-sm font-medium text-slate-700"
        >
          Customer reference
        </label>

        <input
          id="customerReference"
          type="text"
          maxLength={100}
          value={customerReference}
          onChange={(event) =>
            setCustomerReference(event.target.value)
          }
          placeholder="e.g. Customer 001"
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      {createMutation.isError && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          Unable to create the payment request.
          Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />

        {createMutation.isPending
          ? "Creating payment..."
          : "Create payment request"}
      </button>
    </form>
  );
}