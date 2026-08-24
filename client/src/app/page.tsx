"use client";

import Link from "next/link";
import { useCurrentUser } from "@/features/auth/auth.hooks";

import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Clear payment visibility",
    description:
      "Monitor transaction activity and payment performance from one focused dashboard.",
  },
  {
    icon: QrCode,
    title: "QR payment requests",
    description:
      "Create payment requests with unique transaction IDs and simulated QR payment flows.",
  },
  {
    icon: ReceiptText,
    title: "Transaction management",
    description:
      "Search, filter and inspect every transaction with clear payment status tracking.",
  },
];

const highlights = [
  "Track payment activity in real time",
  "Search and filter transactions easily",
  "Simulate payments from pending to completion",
];

export default function HomePage() {
  const { data: user, isPending } = useCurrentUser();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              P
            </div>

            <span className="text-lg font-semibold tracking-tight">
              PayFlow
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isPending ? (
              <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
            ) : user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:px-4"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-4"
                >
                  Log in
                </Link>

                <Link
                  href="/register"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:px-4"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
              <Zap className="h-3.5 w-3.5" />
              Merchant payment management
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Manage payments with clarity and confidence.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              PayFlow gives merchants a focused place to create payment
              requests, track transactions and manage payment activity through a
              simple, modern dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isPending ? (
                <>
                  <div className="h-12 w-36 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-12 w-44 animate-pulse rounded-lg bg-slate-100" />
                </>
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Sign in to dashboard
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 space-y-3">
              {highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-700" />

                  {highlight}
                </div>
              ))}
            </div>
          </div>

          {/* Product preview */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60 sm:p-5">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="flex h-11 items-center gap-2 border-b border-slate-200 bg-slate-50 px-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />

                  <div className="ml-3 h-5 flex-1 rounded bg-white" />
                </div>

                <div className="grid min-h-96 grid-cols-[120px_1fr]">
                  <div className="border-r border-slate-200 bg-white p-3">
                    <div className="mb-6 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[10px] font-bold text-white">
                        P
                      </div>

                      <div className="h-3 w-12 rounded bg-slate-200" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-8 rounded-md bg-slate-100" />
                      <div className="h-8 rounded-md bg-slate-50" />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 sm:p-5">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                    <div className="mt-2 h-7 w-40 rounded bg-slate-300" />

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="h-3 w-16 rounded bg-slate-200" />
                          <div className="mt-3 h-5 w-12 rounded bg-slate-300" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                      <div className="h-3 w-28 rounded bg-slate-200" />

                      <div className="mt-4 space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex justify-between">
                            <div className="h-3 w-24 rounded bg-slate-100" />
                            <div className="h-3 w-12 rounded bg-slate-200" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                  <CreditCard className="h-4 w-4 text-slate-700" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Payment request</p>

                  <p className="text-sm font-semibold text-slate-900">
                    ₹500.00 created
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-slate-500">
              Everything you need
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Built around everyday payment operations.
            </h2>

            <p className="mt-4 text-slate-600">
              A focused set of tools for creating, monitoring and managing
              merchant payment activity without unnecessary complexity.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-xl border border-slate-200 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <h3 className="mt-5 font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
              Ready to manage your payments?
            </h2>

            <p className="mt-3 text-slate-600">
              Create your merchant account and start exploring the PayFlow
              dashboard.
            </p>

            <Link
              href={user ? "/dashboard" : "/register"}
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {user ? "Open dashboard" : "Get started"}

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 PayFlow. Merchant payment management.</p>

          <p>Demo application · Simulated payment flow</p>
        </div>
      </footer>
    </main>
  );
}
