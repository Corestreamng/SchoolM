'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradesApi, GradesResponse, CreateGradeData } from '@/lib/api/grades';

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

export function useCreateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGradeData) => gradesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateGradeData> }) =>
      gradesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
  });
}

