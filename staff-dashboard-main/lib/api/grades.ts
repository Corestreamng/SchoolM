import apiClient from '../api-client';

export interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  class_id: number;
  exam_type: string;
  score: number;
  max_score: number;
  grade?: string;
  remarks?: string;
  exam_date?: string;
  student?: {
    id: number;
    student_id: string;
    user?: {
      name: string;
    };
  };
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  class?: {
    id: number;
    name: string;
  };
}

export interface GradesResponse {
  data: Grade[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateGradeData {
  student_id: number;
  subject_id: number;
  class_id: number;
  exam_type: string;
  score: number;
  max_score?: number;
  grade?: string;
  remarks?: string;
  exam_date?: string;
}

export const gradesApi = {
  getAll: async (params?: {
    student_id?: number;
    subject_id?: number;
    class_id?: number;
    per_page?: number;
  }): Promise<GradesResponse> => {
    const response = await apiClient.get('/grades', { params });
    return response.data;
  },

  create: async (data: CreateGradeData): Promise<Grade> => {
    const response = await apiClient.post('/grades', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateGradeData>): Promise<Grade> => {
    const response = await apiClient.put(`/grades/${id}`, data);
    return response.data;
  },
};

