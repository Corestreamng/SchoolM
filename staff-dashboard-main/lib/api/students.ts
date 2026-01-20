import apiClient from '../api-client';

export interface Student {
  id: number;
  student_id: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  class_id?: number;
  parent_id?: number;
  admission_date?: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  class?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface StudentsResponse {
  data: Student[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const studentsApi = {
  getAll: async (params?: {
    class_id?: number;
    status?: string;
    search?: string;
    per_page?: number;
  }): Promise<StudentsResponse> => {
    const response = await apiClient.get('/students', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Student> => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },
};

