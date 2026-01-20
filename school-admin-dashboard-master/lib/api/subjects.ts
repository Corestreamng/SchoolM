import apiClient from "../api-client";

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: "active" | "inactive";
}

export interface SubjectsResponse {
  data: Subject[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const subjectsApi = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    per_page?: number;
  }): Promise<SubjectsResponse> => {
    const response = await apiClient.get("/subjects", { params });
    return response.data;
  },

  create: async (data: Partial<Subject>): Promise<Subject> => {
    const response = await apiClient.post("/subjects", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Subject>): Promise<Subject> => {
    const response = await apiClient.put(`/subjects/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/subjects/${id}`);
  },
};
