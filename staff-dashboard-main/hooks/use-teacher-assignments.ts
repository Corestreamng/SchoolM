"use client";

import { useQuery } from "@tanstack/react-query";
import {
  teacherAssignmentsApi,
  TeacherAssignment,
  AssignedClass,
} from "@/lib/api/teacher-assignments";

export function useTeacherAssignments(teacherId: number | undefined) {
  return useQuery<TeacherAssignment[]>({
    queryKey: ["teacher-assignments", teacherId],
    queryFn: () => teacherAssignmentsApi.getAssignments(teacherId!),
    enabled: !!teacherId,
  });
}

export function useTeacherAssignedClasses(teacherId: number | undefined) {
  return useQuery<AssignedClass[]>({
    queryKey: ["teacher-assigned-classes", teacherId],
    queryFn: () => teacherAssignmentsApi.getAssignedClasses(teacherId!),
    enabled: !!teacherId,
  });
}
