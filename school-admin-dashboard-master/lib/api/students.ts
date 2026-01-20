import apiClient from "../api-client";

export interface Student {
  id: number;
  student_id: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  class_id?: number;
  parent_id?: number;
  admission_date?: string;
  status: "active" | "inactive" | "graduated" | "suspended";
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  class?: {
    id: number;
    name: string;
    code: string;
  };
  parent?: {
    id: number;
    parent_id: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
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
    const response = await apiClient.get("/students", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Student> => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    student_id: string;
    date_of_birth?: string;
    gender?: "male" | "female" | "other";
    class_id?: number;
    parent_id?: number;
    admission_date?: string;
    status?: "active" | "inactive" | "graduated" | "suspended";
  }): Promise<Student> => {
    const response = await apiClient.post("/students", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Student>): Promise<Student> => {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },

  downloadCsv: async (academicSession: string): Promise<Blob> => {
    const response = await apiClient.get("/students/download/csv", {
      params: { academic_session: academicSession },
      responseType: "blob",
    });
    return response.data;
  },
};
