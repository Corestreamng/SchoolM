"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subjectsApi, SubjectsResponse, Subject } from "@/lib/api/subjects";

export function useSubjects(params?: {
  status?: string;
  search?: string;
  per_page?: number;
}) {
  return useQuery<SubjectsResponse>({
    queryKey: ["subjects", params],
    queryFn: () => subjectsApi.getAll(params),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Subject>) => subjectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Subject> }) =>
      subjectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => subjectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
