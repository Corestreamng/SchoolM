"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import {
  useMessages,
  useCreateMessage,
  useMarkMessageAsRead,
} from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function Messages() {
  const { user } = useAuth();
  const { data: messagesData, isLoading } = useMessages({ per_page: 1000 });
  const messages = messagesData?.data || [];
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const createMessage = useCreateMessage();
  const markAsRead = useMarkMessageAsRead();

  // Group messages by sender/receiver to create conversations
  const conversations = useMemo(() => {
    const conversationMap = new Map<
      number,
      {
        id: number;
        name: string;
        avatar: string;
        lastMessage: string;
        timestamp: string;
        unread: number;
        userId: number;
      }
    >();

    messages.forEach((msg) => {
      // Determine the other user in the conversation
      const otherUserId =
        msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
      const otherUser = msg.sender_id === user?.id ? msg.receiver : msg.sender;

      if (!conversationMap.has(otherUserId)) {
        const initials =
          otherUser?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2) || "??";

        conversationMap.set(otherUserId, {
          id: otherUserId,
          userId: otherUserId,
          name: otherUser?.name || "Unknown",
          avatar: initials,
          lastMessage: msg.message.substring(0, 50),
          timestamp: format(new Date(msg.created_at), "MMM d"),
          unread:
            msg.status === "unread" && msg.receiver_id === user?.id ? 1 : 0,
        });
      } else {
        const conv = conversationMap.get(otherUserId)!;
        const msgDate = new Date(msg.created_at);
        const convDate = new Date(conv.timestamp);
        if (msgDate > convDate) {
          conv.lastMessage = msg.message.substring(0, 50);
          conv.timestamp = format(msgDate, "MMM d");
        }
        if (msg.status === "unread" && msg.receiver_id === user?.id) {
          conv.unread += 1;
        }
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [messages, user?.id]);

  const filtered = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = useMemo(() => {
    if (!selectedUserId) return [];
    return messages
      .filter(
        (msg) =>
          (msg.sender_id === user?.id && msg.receiver_id === selectedUserId) ||
          (msg.receiver_id === user?.id && msg.sender_id === selectedUserId)
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  }, [messages, selectedUserId, user?.id]);

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
    // Mark messages as read when opening conversation
    currentMessages
      .filter((m) => m.status === "unread" && m.receiver_id === user?.id)
      .forEach((m) => markAsRead.mutate(m.id));
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUserId) return;

    createMessage.mutate(
      {
        receiver_id: selectedUserId,
        message: messageText,
      },
      {
        onSuccess: () => {
          setMessageText("");
        },
      }
    );
  };

  const currentConversation = filtered.find((c) => c.id === selectedUserId);

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-600 mt-1">
          Communicate with teachers and administrators
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-500">Loading messages...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Conversation List */}
          <div className="w-full md:w-80 bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  No conversations found
                </div>
              ) : (
                filtered.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-left p-4 transition-colors ${
                      selectedUserId === conv.id
                        ? "bg-blue-50 border-l-2 border-blue-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {conv.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-900 truncate text-sm">
                            {conv.name}
                          </p>
                          {conv.unread > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {conv.timestamp}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex md:flex-1 bg-white rounded-lg border border-slate-200 flex-col overflow-hidden shadow-sm">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-slate-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                      {currentConversation.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {currentConversation.name}
                      </h3>
                      <p className="text-xs text-slate-500">Active now</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentMessages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? "justify-end" : ""}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md rounded-lg px-4 py-3 ${
                            isOwn
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-900 border border-slate-200"
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {message.sender?.name || "Unknown"}
                            </p>
                          )}
                          {message.subject && (
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {message.subject}
                            </p>
                          )}
                          <p className="text-sm">{message.message}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isOwn ? "opacity-75" : "text-slate-500"
                            }`}
                          >
                            {format(new Date(message.created_at), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-200 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleSendMessage()
                      }
                      className="flex-1 bg-white min-h-[60px]"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || createMessage.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send size={20} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-500">
                  Select a conversation to view messages
                </p>
              </div>
            )}
          </div>

          {/* Mobile Placeholder */}
          <div className="md:hidden flex-1 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
            <p className="text-slate-500">
              Select a conversation to view messages
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
