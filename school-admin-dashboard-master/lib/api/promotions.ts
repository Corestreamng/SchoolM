import apiClient from "../api-client";
import type { Student } from "./students";

export interface PromotionPayload {
  student_ids: number[];
  new_class_id: number;
  academic_year?: string;
}

export const promotionsApi = {
  promote: async (
    data: PromotionPayload
  ): Promise<{
    message: string;
    promoted_count: number;
  }> => {
    const response = await apiClient.post("/promotions/promote", data);
    return response.data;
  },

  getStudentsByClass: async (classId: number): Promise<Student[]> => {
    const response = await apiClient.get(
      `/promotions/class/${classId}/students`
    );
    return response.data;
  },
};
