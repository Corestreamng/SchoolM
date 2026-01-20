"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useCreateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      student_id: number;
      class_id: number;
      academic_year: string;
      term: string;
      subject_scores: {
        subject_id: number;
        assignment?: number;
        first_test?: number;
        second_test?: number;
        exam?: number;
      }[];
      form_master_remark?: string;
      principal_remark?: string;
      verbal_skills?: string;
      self_control?: string;
      obedience?: string;
      punctuality?: string;
      honesty?: string;
      assignment?: string;
      neatness?: string;
      attitude_to_learn?: string;
    }) => resultsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });
}

export function useUpdateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StudentResult> }) =>
      resultsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });
}

export function useDeleteResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => resultsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });
}
