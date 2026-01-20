import apiClient from "../api-client";

export interface TeacherAssignment {
  id: number;
  class_id: number;
  class_name: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
}

export const teacherAssignmentsApi = {
  assign: async (data: {
    teacher_id: number;
    subject_id: number;
    class_id: number;
  }) => {
    const response = await apiClient.post("/teacher-assignments/assign", data);
    return response.data;
  },

  remove: async (data: {
    teacher_id: number;
    subject_id: number;
    class_id: number;
  }) => {
    const response = await apiClient.post("/teacher-assignments/remove", data);
    return response.data;
  },

  getAssignments: async (teacherId: number): Promise<TeacherAssignment[]> => {
    const response = await apiClient.get(`/teacher-assignments/${teacherId}`);
    return response.data;
  },

  bulkAssign: async (data: {
    teacher_id: number;
    assignments: {
      subject_id: number;
      class_id: number;
    }[];
  }) => {
    const response = await apiClient.post("/teacher-assignments/bulk", data);
    return response.data;
  },
};
