import apiClient from "../api-client";

export interface TimetableEntry {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id?: number;
  day: string;
  start_time: string;
  end_time: string;
  room?: string;
  class?: {
    id: number;
    name: string;
  };
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  teacher?: {
    id: number;
    user?: {
      name: string;
    };
  };
}

export interface TimetableResponse {
  data: TimetableEntry[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const timetableApi = {
  getAll: async (params?: {
    class_id?: number;
    day?: string;
    per_page?: number;
  }): Promise<TimetableResponse> => {
    const response = await apiClient.get("/timetable", { params });
    return response.data;
  },

  getByClass: async (classId: number): Promise<TimetableEntry[]> => {
    const response = await apiClient.get(`/timetable/class/${classId}`);
    return response.data;
  },

  create: async (data: {
    class_id: number;
    subject_id: number;
    teacher_id?: number;
    day: string;
    start_time: string;
    end_time: string;
    room?: string;
  }): Promise<TimetableEntry> => {
    const response = await apiClient.post("/timetable", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<TimetableEntry>
  ): Promise<TimetableEntry> => {
    const response = await apiClient.put(`/timetable/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/timetable/${id}`);
  },
};
