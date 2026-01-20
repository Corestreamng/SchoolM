"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, Plus } from "lucide-react";
import DashboardLayout from "@/app/dashboard-layout";
import {
  useMessages,
  useCreateMessage,
  useMarkMessageAsRead,
} from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function MessagesPage() {
  const { user } = useAuth();
  const { data: messagesData, isLoading } = useMessages({ per_page: 1000 });
  const messages = messagesData?.data || [];
  const createMessage = useCreateMessage();
  const markAsRead = useMarkMessageAsRead();

  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    messages.length > 0 ? messages[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");

  // Filter messages where current user is receiver
  const receivedMessages = messages.filter(
    (msg) => msg.receiver_id === user?.id
  );

  const filtered = receivedMessages.filter(
    (msg) =>
      msg.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selected =
    filtered.find((m) => m.id === selectedMessageId) || filtered[0];

  const handleSelectMessage = (id: number) => {
    setSelectedMessageId(id);
    const message = messages.find((m) => m.id === id);
    if (message && message.status === "unread") {
      markAsRead.mutate(id);
    }
  };

  const handleSendReply = () => {
    if (!selected || !replyText.trim()) return;

    createMessage.mutate(
      {
        receiver_id: selected.sender_id,
        subject: selected.subject ? `Re: ${selected.subject}` : undefined,
        message: replyText,
      },
      {
        onSuccess: () => {
          setReplyText("");
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={cardVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Messages</h1>
              <p className="text-muted-foreground">
                Communicate with your teachers and administration
              </p>
            </div>
            <Button className="gap-2">
              <Plus size={18} />
              New Message
            </Button>
          </div>
        </motion.div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Loading messages...</p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">No messages available</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inbox List */}
            <motion.div variants={cardVariants} className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Inbox ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={16}
                      />
                      <Input
                        placeholder="Search messages..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filtered.map((message) => (
                      <motion.button
                        key={message.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSelectMessage(message.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedMessageId === message.id
                            ? "bg-primary/10 border-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                            {message.sender?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase() || "??"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                message.status === "unread" ? "font-bold" : ""
                              }`}
                            >
                              {message.sender?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {message.subject || "No subject"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(message.created_at),
                                "MMM d, yyyy"
                              )}
                            </p>
                          </div>
                          {message.status === "unread" && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Message Content */}
            <motion.div variants={cardVariants} className="lg:col-span-2">
              {selected ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                        {selected.sender?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase() || "??"}
                      </div>
                      <div className="flex-1">
                        <CardTitle>
                          {selected.sender?.name || "Unknown"}
                        </CardTitle>
                        <CardDescription>
                          {selected.sender?.email || ""}
                        </CardDescription>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(
                            new Date(selected.created_at),
                            "MMMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      {selected.subject && (
                        <h3 className="font-semibold text-lg mb-2">
                          {selected.subject}
                        </h3>
                      )}
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {selected.message}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Reply to this message..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            handleSendReply()
                          }
                        />
                        <Button
                          size="icon"
                          onClick={handleSendReply}
                          disabled={
                            !replyText.trim() || createMessage.isPending
                          }
                        >
                          <Send size={18} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      Select a message to read
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have {filtered.length} messages
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
