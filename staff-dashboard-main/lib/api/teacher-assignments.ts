import apiClient from "../api-client";

export interface TeacherAssignment {
  id: number;
  class_id: number;
  class_name: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
}

export interface AssignedClass {
  id: number;
  name: string;
  code: string;
  level?: string;
  status: string;
}

export const teacherAssignmentsApi = {
  getAssignments: async (teacherId: number): Promise<TeacherAssignment[]> => {
    const response = await apiClient.get(`/teacher-assignments/${teacherId}`);
    return response.data;
  },

  getAssignedClasses: async (teacherId: number): Promise<AssignedClass[]> => {
    const response = await apiClient.get(
      `/teacher-assignments/${teacherId}/classes`
    );
    return response.data;
  },
};
