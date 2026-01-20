"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parentsApi, ParentsResponse, Parent } from "@/lib/api/parents";

export function useParents(params?: { search?: string; per_page?: number }) {
  return useQuery<ParentsResponse>({
    queryKey: ["parents", params],
    queryFn: () => parentsApi.getAll(params),
  });
}

export function useParent(id: number) {
  return useQuery<Parent>({
    queryKey: ["parents", id],
    queryFn: () => parentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Parent>) => parentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
  });
}

export function useUpdateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Parent> }) =>
      parentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
  });
}

export function useDeleteParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => parentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
  });
}

export function useParentChildren(parentId: number) {
  return useQuery({
    queryKey: ["parents", parentId, "children"],
    queryFn: () => parentsApi.getChildren(parentId),
    enabled: !!parentId,
  });
}
