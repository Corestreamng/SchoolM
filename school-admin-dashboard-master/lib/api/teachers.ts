import apiClient from "../api-client";

export interface TeacherAssignment {
  id?: number;
  class_id: number;
  class_name: string;
  subject_id: number;
  subject_name: string;
  subject_code?: string;
}

export interface Teacher {
  id: number;
  teacher_id: string;
  qualification?: string;
  specialization?: string;
  hire_date?: string;
  status: "active" | "inactive" | "on_leave" | "cashier" | "staff";
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  assignments?: TeacherAssignment[];
}

export interface TeachersResponse {
  data: Teacher[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const teachersApi = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    per_page?: number;
  }): Promise<TeachersResponse> => {
    const response = await apiClient.get("/teachers", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Teacher> => {
    const response = await apiClient.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    teacher_id: string;
    qualification?: string;
    specialization?: string;
    hire_date?: string;
    status?: "active" | "inactive" | "on_leave" | "cashier" | "staff";
  }): Promise<Teacher> => {
    const response = await apiClient.post("/teachers", data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      qualification?: string;
      specialization?: string;
      status?: "active" | "inactive" | "on_leave" | "cashier" | "staff";
    }
  ): Promise<Teacher> => {
    const response = await apiClient.put(`/teachers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/teachers/${id}`);
  },
};
