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
  submissions?: Array<{
    id: number;
    submission_content?: string;
    attachment?: string;
    score?: number;
    feedback?: string;
    status: string;
    submitted_at?: string;
  }>;
}

export interface AssignmentsResponse {
  data: Assignment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const assignmentsApi = {
  getAll: async (params?: {
    class_id?: number;
    subject_id?: number;
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
};

