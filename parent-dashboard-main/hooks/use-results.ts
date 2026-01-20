"use client";

import { useQuery } from "@tanstack/react-query";
import { resultsApi, ResultsResponse, StudentResult } from "@/lib/api/results";

export function useResults(params?: {
  student_id?: number;
  class_id?: number;
  academic_year?: string;
  term?: string;
  per_page?: number;
}) {
  return useQuery<ResultsResponse>({
    queryKey: ["results", params],
    queryFn: () => resultsApi.getAll(params),
  });
}

export function useResult(id: number) {
  return useQuery<StudentResult>({
    queryKey: ["results", id],
    queryFn: () => resultsApi.getById(id),
    enabled: !!id,
  });
}

export function useResultsByStudent(studentId: number) {
  return useQuery<StudentResult[]>({
    queryKey: ["results", "student", studentId],
    queryFn: () => resultsApi.getByStudent(studentId),
    enabled: !!studentId,
  });
}
