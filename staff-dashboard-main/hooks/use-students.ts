'use client';

import { useQuery } from '@tanstack/react-query';
import { studentsApi, StudentsResponse } from '@/lib/api/students';

export function useStudents(params?: {
  class_id?: number;
  status?: string;
  search?: string;
  per_page?: number;
}) {
  return useQuery<StudentsResponse>({
    queryKey: ['students', params],
    queryFn: () => studentsApi.getAll(params),
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => studentsApi.getById(id),
    enabled: !!id,
  });
}

