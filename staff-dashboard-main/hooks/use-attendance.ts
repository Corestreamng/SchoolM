'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, AttendanceResponse, CreateAttendanceData, BulkAttendanceData } from '@/lib/api/attendance';

export function useAttendance(params?: {
  student_id?: number;
  class_id?: number;
  date?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
}) {
  return useQuery<AttendanceResponse>({
    queryKey: ['attendance', params],
    queryFn: () => attendanceApi.getAll(params),
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceData) => attendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useBulkCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkAttendanceData) => attendanceApi.bulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

