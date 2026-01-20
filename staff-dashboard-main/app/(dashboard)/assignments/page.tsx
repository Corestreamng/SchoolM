"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Plus } from "lucide-react";
import { useAssignments, useCreateAssignment } from "@/hooks/use-assignments";
import { useAuth } from "@/context/auth-context";
import {
  useTeacherAssignedClasses,
  useTeacherAssignments,
} from "@/hooks/use-teacher-assignments";
import { useSubjects } from "@/hooks/use-subjects";
import { useStudents } from "@/hooks/use-students";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AssignmentsPage() {
  const { user } = useAuth();
  const teacherId = user?.teacher?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    class_id: "",
    subject_id: "",
    due_date: "",
    max_score: "100",
    status: "published" as "draft" | "published" | "closed",
  });

  const { data: assignmentsData, isLoading } = useAssignments(
    teacherId ? { teacher_id: teacherId, per_page: 1000 } : undefined
  );

  const { data: teacherAssignments } = useTeacherAssignments(teacherId);
  const { data: availableClasses = [] } = useTeacherAssignedClasses(teacherId);
  const { data: subjectsData } = useSubjects({
    status: "active",
    per_page: 1000,
  });

  const assignments = assignmentsData?.data || [];
  const subjects = subjectsData?.data || [];

  // Get available subjects from teacher assignments
  const availableSubjects = subjects.filter((s) =>
    teacherAssignments?.some((a) => a.subject_id === s.id)
  );

  // Filter subjects based on selected class
  const filteredSubjects = formData.class_id
    ? availableSubjects.filter((s) =>
        teacherAssignments?.some(
          (a) =>
            a.class_id === parseInt(formData.class_id) && a.subject_id === s.id
        )
      )
    : availableSubjects;

  const createAssignment = useCreateAssignment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) {
      toast.error("Teacher ID not found");
      return;
    }

    try {
      await createAssignment.mutateAsync({
        ...formData,
        class_id: parseInt(formData.class_id),
        subject_id: parseInt(formData.subject_id),
        max_score: parseInt(formData.max_score) || 100,
      });
      toast.success("Assignment created successfully");
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        class_id: "",
        subject_id: "",
        due_date: "",
        max_score: "100",
        status: "published",
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create assignment"
      );
    }
  };

  // Get total students for each assignment
  const getTotalStudents = (classId: number) => {
    // This would ideally be fetched, but for now we'll use a placeholder
    return 0;
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Manage and grade student assignments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select
                    value={formData.class_id}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        class_id: value,
                        subject_id: "", // Reset subject when class changes
                      })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select
                    value={formData.subject_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subject_id: value })
                    }
                    required
                    disabled={!formData.class_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map((subject) => (
                        <SelectItem
                          key={subject.id}
                          value={subject.id.toString()}
                        >
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Score</Label>
                  <Input
                    type="number"
                    value={formData.max_score}
                    onChange={(e) =>
                      setFormData({ ...formData, max_score: e.target.value })
                    }
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "draft" | "published" | "closed") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAssignment.isPending}>
                  {createAssignment.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No assignments found
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, idx) => {
            const submissionCount = 0; // TODO: Get from assignment submissions when available
            // Get total students in class - this would need to come from the class or be calculated
            const totalStudents = getTotalStudents(assignment.class_id);

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-card rounded-lg p-6 border border-border shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assignment.class?.name || "Class"} -{" "}
                        {assignment.subject?.name || "Subject"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Due:{" "}
                        {format(new Date(assignment.due_date), "MMM d, yyyy")}
                      </p>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {assignment.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {submissionCount}/{totalStudents || "?"}
                      </p>
                      <p className="text-xs text-muted-foreground">submitted</p>
                    </div>
                    <Badge
                      variant={
                        assignment.status === "closed" ? "default" : "outline"
                      }
                      className="w-fit capitalize"
                    >
                      {assignment.status}
                    </Badge>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <Eye size={18} className="text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <Download size={18} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
