"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  paymentsApi,
  PaymentsResponse,
  CreatePaymentData,
  Payment,
} from "@/lib/api/payments";

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

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentData) => paymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<
        CreatePaymentData & { status?: string; paid_date?: string }
      >;
    }) => paymentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
