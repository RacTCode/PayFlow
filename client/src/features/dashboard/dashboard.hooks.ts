import { useQuery } from "@tanstack/react-query";

import { getDashboardStats } from "./dashboard.api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });
}