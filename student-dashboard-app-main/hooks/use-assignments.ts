'use client';

import { useQuery } from '@tanstack/react-query';
import { assignmentsApi, AssignmentsResponse } from '@/lib/api/assignments';

export function useAssignments(params?: {
  class_id?: number;
  subject_id?: number;
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

