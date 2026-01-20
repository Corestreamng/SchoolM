"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, MessageSquare, Send, Plus } from "lucide-react";
import { useState } from "react";
import { useMessages, useCreateMessage } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";

export default function MessagingPage() {
  const { toast } = useToast();
  const { data: messagesData } = useMessages();
  const createMessage = useCreateMessage();
  const [isComposing, setIsComposing] = useState(false);
  const [formData, setFormData] = useState({
    messageType: "email",
    recipient: "all-parents",
    subject: "",
    content: "",
  });

  const messages = messagesData?.data || [];

  const handleSendMessage = async () => {
    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    try {
      let recipientType: "all_parents" | "all_teachers" | undefined;
      if (formData.recipient === "all-parents") {
        recipientType = "all_parents";
      } else if (formData.recipient === "all-teachers") {
        recipientType = "all_teachers";
      }

      await createMessage.mutateAsync({
        recipient_type: recipientType,
        subject:
          formData.messageType === "email" ? formData.subject : undefined,
        message: formData.content,
        send_email: formData.messageType === "email",
      });

      toast({
        title: "Success",
        description: "Message sent successfully.",
      });

      setFormData({
        messageType: "email",
        recipient: "all-parents",
        subject: "",
        content: "",
      });
      setIsComposing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const emailCount = messages.filter((m) => m.subject).length;
  const smsCount = messages.filter((m) => !m.subject).length;

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <TopNav />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Messaging
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Send bulk emails and SMS to students, parents, and teachers
                  </p>
                </div>
                <Dialog open={isComposing} onOpenChange={setIsComposing}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus size={18} />
                      Compose Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Send New Message</DialogTitle>
                      <DialogDescription>
                        Send emails or SMS to students, parents, or teachers
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Message Type
                        </label>
                        <Select
                          value={formData.messageType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, messageType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Recipient</label>
                        <Select
                          value={formData.recipient}
                          onValueChange={(value) =>
                            setFormData({ ...formData, recipient: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-parents">
                              All Parents
                            </SelectItem>
                            <SelectItem value="all-teachers">
                              All Teachers
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.messageType === "email" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Subject</label>
                          <Input
                            placeholder="Email subject"
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                subject: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Message Content
                        </label>
                        <Textarea
                          placeholder="Type your message here..."
                          rows={6}
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              content: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setIsComposing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          className="gap-2"
                          disabled={createMessage.isPending}
                        >
                          <Send size={16} />
                          {createMessage.isPending
                            ? "Sending..."
                            : "Send Message"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <Mail className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Emails Sent
                      </p>
                      <p className="text-2xl font-bold">{emailCount}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">SMS Sent</p>
                      <p className="text-2xl font-bold">{smsCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Message History */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Message History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                {message.subject ? (
                                  <Mail size={16} />
                                ) : (
                                  <MessageSquare size={16} />
                                )}
                                <span className="font-medium">
                                  {message.receiver?.name || "Recipient"}
                                </span>
                                <Badge
                                  className={
                                    message.subject
                                      ? "bg-blue-500/20 text-blue-700"
                                      : "bg-green-500/20 text-green-700"
                                  }
                                >
                                  {message.subject ? "EMAIL" : "MESSAGE"}
                                </Badge>
                                <Badge
                                  variant={
                                    message.status === "read"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {message.status}
                                </Badge>
                              </div>
                              {message.subject && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Subject: {message.subject}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                message.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No messages sent yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
