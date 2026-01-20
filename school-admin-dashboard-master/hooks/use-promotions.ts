"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { promotionsApi, PromotionPayload } from "@/lib/api/promotions";
import type { Student } from "@/lib/api/students";

export function useStudentsByClassForPromotion(classId: number) {
  return useQuery<Student[]>({
    queryKey: ["promotions", "students", classId],
    queryFn: () => promotionsApi.getStudentsByClass(classId),
    enabled: !!classId,
  });
}

export function usePromoteStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PromotionPayload) => promotionsApi.promote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}
