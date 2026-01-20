'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceApi, AttendanceResponse } from '@/lib/api/attendance';

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

