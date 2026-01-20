import apiClient from "../api-client";

export interface SubjectScore {
  id: number;
  subject_id: number;
  assignment?: number;
  first_test?: number;
  second_test?: number;
  exam?: number;
  total?: number;
  position?: number;
  grade?: string; // A, B, C, D, E
  remarks?: string; // Excellent, Very good, Good, Average, Poor
  subject?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface StudentResult {
  id: number;
  student_id: number;
  class_id: number;
  academic_year: string;
  term: string;
  subject_scores: SubjectScore[];
  form_master_remark?: string;
  principal_remark?: string;
  verbal_skills?: string; // A, B, C, D, E
  self_control?: string;
  obedience?: string;
  punctuality?: string;
  honesty?: string;
  assignment?: string;
  neatness?: string;
  attitude_to_learn?: string;
  total_subjects?: number;
  total_score?: number;
  created_at?: string;
  updated_at?: string;
  student?: {
    id: number;
    student_id?: string;
    user?: {
      name: string;
      email: string;
    };
  };
  class?: {
    id: number;
    name: string;
  };
}

export interface ResultsResponse {
  data: StudentResult[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const resultsApi = {
  getAll: async (params?: {
    student_id?: number;
    class_id?: number;
    academic_year?: string;
    term?: string;
    per_page?: number;
  }): Promise<ResultsResponse> => {
    const response = await apiClient.get("/results", { params });
    return response.data;
  },

  getById: async (id: number): Promise<StudentResult> => {
    const response = await apiClient.get(`/results/${id}`);
    return response.data;
  },

  getByStudent: async (studentId: number): Promise<StudentResult[]> => {
    const response = await apiClient.get(`/results/student/${studentId}`);
    return response.data;
  },

  create: async (data: {
    student_id: number;
    class_id: number;
    academic_year: string;
    term: string;
    subject_scores: {
      subject_id: number;
      assignment?: number;
      first_test?: number;
      second_test?: number;
      exam?: number;
    }[];
    form_master_remark?: string;
    principal_remark?: string;
    verbal_skills?: string;
    self_control?: string;
    obedience?: string;
    punctuality?: string;
    honesty?: string;
    assignment?: string;
    neatness?: string;
    attitude_to_learn?: string;
  }): Promise<StudentResult> => {
    const response = await apiClient.post("/results", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<StudentResult>
  ): Promise<StudentResult> => {
    const response = await apiClient.put(`/results/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/results/${id}`);
  },

  downloadCsv: async (params: {
    academic_year: string;
    term: string;
    class_id?: number;
  }): Promise<Blob> => {
    const response = await apiClient.get('/results/download/csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
