"use client";

import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useEffect,
} from "react";

import { useCurrentUser } from "@/features/auth/auth.hooks";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();

  useEffect(() => {
    if (currentUserQuery.isError) {
      router.replace("/login");
    }
  }, [currentUserQuery.isError, router]);

  if (currentUserQuery.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  if (currentUserQuery.isError) {
    return null;
  }

  return <>{children}</>;
}