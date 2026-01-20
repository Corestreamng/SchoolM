"use client";

import { useQuery } from "@tanstack/react-query";
import { classesApi, ClassesResponse } from "@/lib/api/classes";

export function useClasses(params?: {
  status?: string;
  search?: string;
  per_page?: number;
}) {
  return useQuery<ClassesResponse>({
    queryKey: ["classes", params],
    queryFn: () => classesApi.getAll(params),
  });
}

export function useClass(id: number) {
  return useQuery({
    queryKey: ["classes", id],
    queryFn: () => classesApi.getById(id),
    enabled: !!id,
  });
}
