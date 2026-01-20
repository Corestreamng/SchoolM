import apiClient from '../api-client';

export interface Attendance {
  id: number;
  student_id: number;
  class_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  student?: {
    id: number;
    student_id: string;
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

export interface AttendanceResponse {
  data: Attendance[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateAttendanceData {
  student_id: number;
  class_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface BulkAttendanceData {
  class_id: number;
  date: string;
  attendances: Array<{
    student_id: number;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>;
}

export const attendanceApi = {
  getAll: async (params?: {
    student_id?: number;
    class_id?: number;
    date?: string;
    date_from?: string;
    date_to?: string;
    per_page?: number;
  }): Promise<AttendanceResponse> => {
    const response = await apiClient.get('/attendance', { params });
    return response.data;
  },

  create: async (data: CreateAttendanceData): Promise<Attendance> => {
    const response = await apiClient.post('/attendance', data);
    return response.data;
  },

  bulkCreate: async (data: BulkAttendanceData): Promise<Attendance[]> => {
    const response = await apiClient.post('/attendance/bulk', data);
    return response.data;
  },
};

