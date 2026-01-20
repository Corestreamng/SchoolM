'use client';

import { useQuery } from '@tanstack/react-query';
import { gradesApi, GradesResponse } from '@/lib/api/grades';

export function useGrades(params?: {
  student_id?: number;
  subject_id?: number;
  class_id?: number;
  per_page?: number;
}) {
  return useQuery<GradesResponse>({
    queryKey: ['grades', params],
    queryFn: () => gradesApi.getAll(params),
  });
}

