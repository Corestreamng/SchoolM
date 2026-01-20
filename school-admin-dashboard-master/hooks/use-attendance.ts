import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Types
interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  date: string;
  session: "morning" | "afternoon";
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
  student: {
    user: {
      name: string;
    };
    student_id: string;
  };
}

interface AttendanceSummary {
  total_students: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

interface Student {
  id: number;
  user: {
    name: string;
  };
  student_id: string;
}

// API functions
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const attendanceApi = {
  recordAttendance: async (data: {
    class_id: number;
    date: string;
    session: "morning" | "afternoon";
    attendances: Array<{
      student_id: number;
      status: "present" | "absent" | "late" | "excused";
      remarks?: string;
    }>;
  }) => {
    const response = await axios.post(
      `${API_BASE_URL}/attendance/record`,
      data,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  getClassAttendance: async (params: {
    class_id: number;
    date: string;
    session?: "morning" | "afternoon";
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.append("class_id", params.class_id.toString());
    searchParams.append("date", params.date);
    if (params.session) searchParams.append("session", params.session);

    const response = await axios.get(
      `${API_BASE_URL}/attendance/class?${searchParams}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  getStudentAttendance: async (
    studentId: number,
    params: {
      start_date?: string;
      end_date?: string;
    },
  ) => {
    const searchParams = new URLSearchParams();
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);

    const response = await axios.get(
      `${API_BASE_URL}/attendance/student/${studentId}?${searchParams}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  getClassAttendanceReport: async (params: {
    class_id: number;
    start_date: string;
    end_date: string;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.append("class_id", params.class_id.toString());
    searchParams.append("start_date", params.start_date);
    searchParams.append("end_date", params.end_date);

    const response = await axios.get(
      `${API_BASE_URL}/attendance/report/class?${searchParams}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  getAttendanceStats: async (params: {
    class_id?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.class_id)
      searchParams.append("class_id", params.class_id.toString());
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);

    const response = await axios.get(
      `${API_BASE_URL}/attendance/stats?${searchParams}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },
};

// Hooks
export const useRecordAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.recordAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
    },
  });
};

export const useClassAttendance = (params: {
  class_id: number;
  date: string;
  session?: "morning" | "afternoon";
}) => {
  return useQuery({
    queryKey: ["class-attendance", params],
    queryFn: () => attendanceApi.getClassAttendance(params),
    enabled: !!(params.class_id && params.date),
  });
};

export const useStudentAttendance = (
  studentId: number,
  params: {
    start_date?: string;
    end_date?: string;
  },
) => {
  return useQuery({
    queryKey: ["student-attendance", studentId, params],
    queryFn: () => attendanceApi.getStudentAttendance(studentId, params),
    enabled: !!studentId,
  });
};

export const useClassAttendanceReport = (params: {
  class_id: number;
  start_date: string;
  end_date: string;
}) => {
  return useQuery({
    queryKey: ["class-attendance-report", params],
    queryFn: () => attendanceApi.getClassAttendanceReport(params),
    enabled: !!(params.class_id && params.start_date && params.end_date),
  });
};

export const useAttendanceStats = (params: {
  class_id?: number;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: ["attendance-stats", params],
    queryFn: () => attendanceApi.getAttendanceStats(params),
  });
};
