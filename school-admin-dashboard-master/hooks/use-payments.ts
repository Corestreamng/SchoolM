"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentsApi, PaymentsResponse } from "@/lib/api/payments";

export function usePayments(params?: {
  student_id?: number;
  status?: string;
  payment_type?: string;
  per_page?: number;
}) {
  return useQuery<PaymentsResponse>({
    queryKey: ["payments", params],
    queryFn: () => paymentsApi.getAll(params),
  });
}
