import apiClient from "../api-client";

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  subject?: string;
  message: string;
  status: "unread" | "read" | "archived";
  read_at?: string;
  created_at: string;
  sender?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  receiver?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface MessagesResponse {
  data: Message[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateMessageData {
  receiver_id: number;
  subject?: string;
  message: string;
}

export const messagesApi = {
  getAll: async (params?: {
    status?: string;
    unread_only?: boolean;
    per_page?: number;
  }): Promise<MessagesResponse> => {
    //debug
    console.log("params", params);
    const response = await apiClient.get("/messages", { params });
    return response.data;
  },

  create: async (data: CreateMessageData): Promise<Message> => {
    const response = await apiClient.post("/messages", data);
    return response.data;
  },

  markAsRead: async (id: number): Promise<Message> => {
    const response = await apiClient.put(`/messages/${id}/read`);
    return response.data;
  },
};
