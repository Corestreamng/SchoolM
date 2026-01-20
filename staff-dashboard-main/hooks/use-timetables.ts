'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timetablesApi, Timetable, CreateTimetableData } from '@/lib/api/timetables';

export function useTimetables(params?: {
  class_id?: number;
  day_of_week?: string;
}) {
  return useQuery<Timetable[]>({
    queryKey: ['timetables', params],
    queryFn: () => timetablesApi.getAll(params),
  });
}

export function useCreateTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimetableData) => timetablesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
    },
  });
}

export function useUpdateTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTimetableData> }) =>
      timetablesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
    },
  });
}

export function useDeleteTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => timetablesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
    },
  });
}

