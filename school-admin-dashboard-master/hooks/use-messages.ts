"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  messagesApi,
  MessagesResponse,
  Message,
  CreateMessageData,
} from "@/lib/api/messages";

export function useMessages(params?: {
  status?: string;
  unread_only?: boolean;
  per_page?: number;
}) {
  return useQuery<MessagesResponse>({
    queryKey: ["messages", params],
    queryFn: () => messagesApi.getAll(params),
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessageData) => messagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => messagesApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
