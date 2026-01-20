'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi, AssignmentsResponse, CreateAssignmentData } from '@/lib/api/assignments';

export function useAssignments(params?: {
  class_id?: number;
  subject_id?: number;
  teacher_id?: number;
  status?: string;
  per_page?: number;
}) {
  return useQuery<AssignmentsResponse>({
    queryKey: ['assignments', params],
    queryFn: () => assignmentsApi.getAll(params),
  });
}

export function useAssignment(id: number) {
  return useQuery({
    queryKey: ['assignments', id],
    queryFn: () => assignmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentData) => assignmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateAssignmentData> }) =>
      assignmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => assignmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

