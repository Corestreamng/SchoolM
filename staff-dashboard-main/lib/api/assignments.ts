import apiClient from '../api-client';

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  class_id: number;
  teacher_id: number;
  due_date: string;
  max_score: number;
  status: 'draft' | 'published' | 'closed';
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  class?: {
    id: number;
    name: string;
    code: string;
  };
  teacher?: {
    id: number;
    teacher_id: string;
    user?: {
      name: string;
    };
  };
}

export interface AssignmentsResponse {
  data: Assignment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateAssignmentData {
  title: string;
  description?: string;
  subject_id: number;
  class_id: number;
  due_date: string;
  max_score?: number;
  status?: 'draft' | 'published' | 'closed';
}

export const assignmentsApi = {
  getAll: async (params?: {
    class_id?: number;
    subject_id?: number;
    teacher_id?: number;
    status?: string;
    per_page?: number;
  }): Promise<AssignmentsResponse> => {
    const response = await apiClient.get('/assignments', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Assignment> => {
    const response = await apiClient.get(`/assignments/${id}`);
    return response.data;
  },

  create: async (data: CreateAssignmentData): Promise<Assignment> => {
    const response = await apiClient.post('/assignments', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateAssignmentData>): Promise<Assignment> => {
    const response = await apiClient.put(`/assignments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/assignments/${id}`);
  },
};

