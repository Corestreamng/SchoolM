"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  timetableApi,
  TimetableResponse,
  TimetableEntry,
} from "@/lib/api/timetable";

export function useTimetable(params?: {
  class_id?: number;
  day?: string;
  per_page?: number;
}) {
  return useQuery<TimetableResponse>({
    queryKey: ["timetable", params],
    queryFn: () => timetableApi.getAll(params),
  });
}

export function useTimetableByClass(classId: number) {
  return useQuery<TimetableEntry[]>({
    queryKey: ["timetable", "class", classId],
    queryFn: () => timetableApi.getByClass(classId),
    enabled: !!classId,
  });
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      class_id: number;
      subject_id: number;
      teacher_id?: number;
      day: string;
      start_time: string;
      end_time: string;
      room?: string;
    }) => timetableApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      queryClient.invalidateQueries({
        queryKey: ["timetable", "class", variables.class_id],
      });
    },
  });
}

export function useUpdateTimetableEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TimetableEntry> }) =>
      timetableApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
    },
  });
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => timetableApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
    },
  });
}
