'use client';

import { useQuery } from '@tanstack/react-query';
import { timetablesApi, Timetable } from '@/lib/api/timetables';

export function useTimetables(params?: {
  class_id?: number;
  day_of_week?: string;
}) {
  return useQuery<Timetable[]>({
    queryKey: ['timetables', params],
    queryFn: () => timetablesApi.getAll(params),
  });
}

