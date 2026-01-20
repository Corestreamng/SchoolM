"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teachersApi, TeachersResponse, Teacher } from "@/lib/api/teachers";

export function useTeachers(params?: {
  status?: string;
  search?: string;
  per_page?: number;
}) {
  return useQuery<TeachersResponse>({
    queryKey: ["teachers", params],
    queryFn: () => teachersApi.getAll(params),
  });
}

export function useTeacher(id: number) {
  return useQuery<Teacher>({
    queryKey: ["teachers", id],
    queryFn: () => teachersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password?: string;
      phone?: string;
      teacher_id: string;
      qualification?: string;
      specialization?: string;
      hire_date?: string;
      status?: "active" | "inactive" | "on_leave" | "cashier" | "staff";
    }) => teachersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name?: string;
        email?: string;
        phone?: string;
        qualification?: string;
        specialization?: string;
        status?: "active" | "inactive" | "on_leave" | "cashier" | "staff";
      };
    }) => teachersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => teachersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}
