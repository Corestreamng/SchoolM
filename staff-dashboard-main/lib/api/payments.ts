import apiClient from "../api-client";

export interface Payment {
  id: number;
  student_id: number;
  payment_type: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method?: string;
  transaction_id?: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
  student?: {
    id: number;
    student_id: string;
    user?: {
      name: string;
      email: string;
    };
    class?: {
      id: number;
      name: string;
    };
  };
}

export interface PaymentsResponse {
  data: Payment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreatePaymentData {
  student_id: number;
  payment_type: string;
  amount: number;
  payment_method?: string;
  transaction_id?: string;
  due_date?: string;
  notes?: string;
}

export const paymentsApi = {
  getAll: async (params?: {
    student_id?: number;
    status?: string;
    payment_type?: string;
    per_page?: number;
  }): Promise<PaymentsResponse> => {
    const response = await apiClient.get("/payments", { params });
    return response.data;
  },

  create: async (data: CreatePaymentData): Promise<Payment> => {
    const response = await apiClient.post("/payments", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreatePaymentData & { status?: string; paid_date?: string }>
  ): Promise<Payment> => {
    const response = await apiClient.put(`/payments/${id}`, data);
    return response.data;
  },
};
