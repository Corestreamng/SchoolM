"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentsApi, StudentsResponse, Student } from "@/lib/api/students";

export function useStudents(params?: {
  class_id?: number;
  status?: string;
  search?: string;
  per_page?: number;
}) {
  return useQuery<StudentsResponse>({
    queryKey: ["students", params],
    queryFn: () => studentsApi.getAll(params),
  });
}

export function useStudent(id: number) {
  return useQuery<Student>({
    queryKey: ["students", id],
    queryFn: () => studentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password?: string;
      phone?: string;
      student_id: string;
      date_of_birth?: string;
      gender?: "male" | "female" | "other";
      class_id?: number;
      parent_id?: number;
      admission_date?: string;
      status?: "active" | "inactive" | "graduated" | "suspended";
    }) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Student> }) =>
      studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
