import apiClient from "../api-client";

export interface SchoolClass {
  id: number;
  name: string;
  code: string;
  level?: string;
  class_teacher_id?: number;
  capacity: number;
  status: "active" | "inactive";
  class_teacher?: {
    id: number;
    teacher_id: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export interface ClassesResponse {
  data: SchoolClass[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const classesApi = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    per_page?: number;
  }): Promise<ClassesResponse> => {
    const response = await apiClient.get("/classes", { params });
    return response.data;
  },

  getById: async (id: number): Promise<SchoolClass> => {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data;
  },
};
