"use client";

import { motion } from "framer-motion";
import { Suspense, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Send, Paperclip } from "lucide-react";
import {
  useMessages,
  useCreateMessage,
  useMarkMessageAsRead,
} from "@/hooks/use-messages";
import { useAuth } from "@/context/auth-context";
import { format } from "date-fns";

function MessagesContent() {
  const { user } = useAuth();
  const { data: messagesData, isLoading } = useMessages({ per_page: 1000 });
  const messages = messagesData?.data || [];
  const createMessage = useCreateMessage();
  const markAsRead = useMarkMessageAsRead();

  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    messages.length > 0 ? messages[0].id : null
  );
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
    if (!selectedMessageId) return [];
    const selectedConv = filtered.find((c) => c.id === selectedMessageId);
    if (!selectedConv) return [];

    return messages
      .filter(
        (msg) =>
          (msg.sender_id === user?.id &&
            msg.receiver_id === selectedConv.userId) ||
          (msg.receiver_id === user?.id &&
            msg.sender_id === selectedConv.userId)
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  }, [messages, selectedMessageId, filtered, user?.id]);

  const handleSelectConversation = (userId: number) => {
    setSelectedMessageId(userId);
    // Mark messages as read when opening conversation
    currentMessages
      .filter((m) => m.status === "unread" && m.receiver_id === user?.id)
      .forEach((m) => markAsRead.mutate(m.id));
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedMessageId) return;

    createMessage.mutate(
      {
        receiver_id: selectedMessageId,
        message: messageText,
      },
      {
        onSuccess: () => {
          setMessageText("");
        },
      }
    );
  };

  const currentConversation = filtered.find((c) => c.id === selectedMessageId);

  return (
    <motion.div
      className="space-y-6 h-[calc(100vh-120px)] md:h-[calc(100vh-200px)] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Communicate with staff and administrators
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading messages...
        </div>
      ) : (
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Conversation List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-80 bg-card rounded-lg border border-border flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations found
                </div>
              ) : (
                filtered.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    whileHover={{ backgroundColor: "var(--secondary)" }}
                    className={`w-full text-left p-4 transition-colors ${
                      selectedMessageId === conv.id
                        ? "bg-primary/10 border-l-2 border-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {conv.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-foreground truncate text-sm">
                            {conv.name}
                          </p>
                          {conv.unread > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conv.timestamp}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex md:flex-1 bg-card rounded-lg border border-border flex-col overflow-hidden"
          >
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {currentConversation.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {currentConversation.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Active now
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentMessages.map((message, idx) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex gap-3 ${isOwn ? "justify-end" : ""}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md rounded-lg px-4 py-3 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground border border-border"
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {message.sender?.name || "Unknown"}
                            </p>
                          )}
                          <p className="text-sm">{message.message}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isOwn ? "opacity-75" : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(message.created_at), "h:mm a")}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Input Area */}
                <div className="border-t border-border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Paperclip size={20} className="text-muted-foreground" />
                    </button>
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      className="flex-1 bg-background"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || createMessage.isPending}
                      className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Select a conversation to view messages
                </p>
              </div>
            )}
          </motion.div>

          {/* Mobile Placeholder */}
          <div className="md:hidden flex-1 bg-card rounded-lg border border-border flex items-center justify-center">
            <p className="text-muted-foreground">
              Select a conversation to view messages
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}
