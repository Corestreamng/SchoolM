"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  teacherAssignmentsApi,
  TeacherAssignment,
} from "@/lib/api/teacher-assignments";

export function useTeacherAssignments(teacherId: number) {
  return useQuery<TeacherAssignment[]>({
    queryKey: ["teacher-assignments", teacherId],
    queryFn: () => teacherAssignmentsApi.getAssignments(teacherId),
    enabled: !!teacherId,
  });
}

export function useAssignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      teacher_id: number;
      subject_id: number;
      class_id: number;
    }) => teacherAssignmentsApi.assign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
}

export function useRemoveTeacherAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      teacher_id: number;
      subject_id: number;
      class_id: number;
    }) => teacherAssignmentsApi.remove(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
}

export function useBulkAssignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      teacher_id: number;
      assignments: {
        subject_id: number;
        class_id: number;
      }[];
    }) => teacherAssignmentsApi.bulkAssign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
}
