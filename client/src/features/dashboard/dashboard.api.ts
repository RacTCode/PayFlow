import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export interface DashboardStats {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalVolume: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<
    ApiResponse<{ dashboard: DashboardStats }>
  >("/dashboard");

  return response.data.data.dashboard;
}