"use client";

import { useQuery } from "@tanstack/react-query";
import { subjectsApi, SubjectsResponse } from "@/lib/api/subjects";

export function useSubjects(params?: {
  status?: string;
  search?: string;
  per_page?: number;
}) {
  return useQuery<SubjectsResponse>({
    queryKey: ["subjects", params],
    queryFn: () => subjectsApi.getAll(params),
  });
}
