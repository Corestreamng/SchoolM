"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classesApi, ClassesResponse, SchoolClass } from "@/lib/api/classes";

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
  return useQuery<SchoolClass>({
    queryKey: ["classes", id],
    queryFn: () => classesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SchoolClass>) => classesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SchoolClass> }) =>
      classesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => classesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}
