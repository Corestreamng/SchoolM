import apiClient from "../api-client";

export interface DashboardStats {
  kpis: Array<{
    label: string;
    value: string;
    change: string;
    icon: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  studentGrowth: Array<{
    month: string;
    students: number;
  }>;
  topStudents: Array<{
    name: string;
    score: string;
    subject: string;
  }>;
  topTeachers: Array<{
    name: string;
    rating: string;
    subject: string;
  }>;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/dashboard/stats");
    return response.data;
  },
};
