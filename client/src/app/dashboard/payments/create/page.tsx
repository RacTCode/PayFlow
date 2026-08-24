import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreatePaymentForm } from "@/components/payments/create-payment-form";

export default function CreatePaymentPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/dashboard/transactions"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to transactions
      </Link>

      <section>
        <p className="text-sm font-medium text-slate-500">
          Payments
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Create payment request
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a QR payment request for your customer.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <CreatePaymentForm />
      </section>

      <p className="text-center text-xs text-slate-400">
        This is a simulated payment flow. No real payment
        will be processed.
      </p>
    </div>
  );
}