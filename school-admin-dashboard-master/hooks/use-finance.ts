import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Types
interface FinanceSummary {
  total_payments: number;
  total_amount: number;
  overdue_amount: number;
  students_with_overdue: number;
}

interface Payment {
  id: number;
  payment_reference: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  student: {
    user: {
      name: string;
    };
  };
}

interface FeeType {
  id: number;
  name: string;
  description: string;
  amount: number;
  frequency: string;
  is_mandatory: boolean;
  is_active: boolean;
}

interface StudentFee {
  id: number;
  student_id: number;
  fee_type_id: number;
  amount: number;
  due_date: string;
  status: string;
  notes?: string;
  student: {
    user: {
      name: string;
    };
  };
  fee_type: FeeType;
}

// API functions
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const financeApi = {
  getReports: async (params: {
    start_date?: string;
    end_date?: string;
    class_id?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);
    if (params.class_id)
      searchParams.append("class_id", params.class_id.toString());

    const response = await axios.get(
      `${API_BASE_URL}/finance/reports?${searchParams}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  getOverdueFees: async () => {
    const response = await axios.get(`${API_BASE_URL}/finance/overdue`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getFeeTypes: async () => {
    const response = await axios.get(`${API_BASE_URL}/finance/fee-types`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  createFeeType: async (data: Partial<FeeType>) => {
    const response = await axios.post(
      `${API_BASE_URL}/finance/fee-types`,
      data,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  recordPayment: async (data: {
    student_id: number;
    student_fee_id?: number;
    amount: number;
    payment_method: string;
    payment_date: string;
    notes?: string;
    transaction_id?: string;
  }) => {
    const response = await axios.post(
      `${API_BASE_URL}/finance/payments`,
      data,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  getStudentFinancialSummary: async (studentId: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/finance/student/${studentId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },

  assignFeeToStudent: async (data: {
    student_id: number;
    fee_type_id: number;
    amount?: number;
    due_date: string;
    notes?: string;
  }) => {
    const response = await axios.post(
      `${API_BASE_URL}/finance/assign-fee`,
      data,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  },
};

// Hooks
export const useFinanceReports = (params: {
  start_date?: string;
  end_date?: string;
  class_id?: number;
}) => {
  return useQuery({
    queryKey: ["finance-reports", params],
    queryFn: () => financeApi.getReports(params),
    enabled: !!(params.start_date && params.end_date),
  });
};

export const useOverdueFees = () => {
  return useQuery({
    queryKey: ["overdue-fees"],
    queryFn: financeApi.getOverdueFees,
  });
};

export const useFeeTypes = () => {
  return useQuery({
    queryKey: ["fee-types"],
    queryFn: financeApi.getFeeTypes,
  });
};

export const useCreateFeeType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financeApi.createFeeType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-types"] });
    },
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financeApi.recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-reports"] });
      queryClient.invalidateQueries({ queryKey: ["overdue-fees"] });
    },
  });
};

export const useStudentFinancialSummary = (studentId: number) => {
  return useQuery({
    queryKey: ["student-financial-summary", studentId],
    queryFn: () => financeApi.getStudentFinancialSummary(studentId),
    enabled: !!studentId,
  });
};

export const useAssignFeeToStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financeApi.assignFeeToStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-financial-summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["overdue-fees"] });
    },
  });
};
