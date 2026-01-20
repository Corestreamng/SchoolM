"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi, DashboardStats } from "@/lib/api/dashboard";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.getStats(),
  });
}
