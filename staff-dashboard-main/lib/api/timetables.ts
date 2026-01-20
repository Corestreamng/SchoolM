import apiClient from "../api-client";

export interface Timetable {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  class?: {
    id: number;
    name: string;
    code: string;
  };
  subject?: {
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

export interface CreateTimetableData {
  class_id: number;
  subject_id: number;
  teacher_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
}

export const timetablesApi = {
  getAll: async (params?: {
    class_id?: number;
    day_of_week?: string;
    teacher_id?: number;
    per_page?: number;
  }): Promise<Timetable[]> => {
    const response = await apiClient.get("/timetable", {
      params: { ...params, per_page: params?.per_page || 1000 },
    });
    // Backend returns paginated response, extract data array
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  },

  create: async (data: CreateTimetableData): Promise<Timetable> => {
    const response = await apiClient.post("/timetable", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreateTimetableData>
  ): Promise<Timetable> => {
    const response = await apiClient.put(`/timetable/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/timetable/${id}`);
  },
};
