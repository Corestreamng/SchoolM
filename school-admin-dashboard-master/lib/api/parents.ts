import apiClient from "../api-client";

export interface Parent {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  parent_id: string;
  occupation?: string;
  relationship?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  students?: Array<{
    id: number;
    student_id: string;
    user?: {
      name: string;
      email: string;
    };
    class?: {
      name: string;
      code: string;
    };
  }>;
}

export interface ParentsResponse {
  data: Parent[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const parentsApi = {
  getAll: async (params?: {
    search?: string;
    per_page?: number;
  }): Promise<ParentsResponse> => {
    const response = await apiClient.get("/parents", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Parent> => {
    const response = await apiClient.get(`/parents/${id}`);
    return response.data;
  },

  create: async (data: Partial<Parent>): Promise<Parent> => {
    const response = await apiClient.post("/parents", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Parent>): Promise<Parent> => {
    const response = await apiClient.put(`/parents/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/parents/${id}`);
  },

  getChildren: async (
    id: number
  ): Promise<{
    parent: {
      id: number;
      name: string;
      email: string;
    };
    children: Array<{
      id: number;
      student_id: string;
      user?: {
        name: string;
        email: string;
      };
      class?: {
        id: number;
        name: string;
        code: string;
      };
    }>;
  }> => {
    const response = await apiClient.get(`/parents/${id}/children`);
    return response.data;
  },
};
