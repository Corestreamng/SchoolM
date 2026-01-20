"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useUpdateClass } from "@/hooks/use-classes";
import { useTeachers } from "@/hooks/use-teachers";
import { useToast } from "@/hooks/use-toast";
import { SchoolClass } from "@/lib/api/classes";

interface EditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: SchoolClass | null;
}

export default function EditClassDialog({
  open,
  onOpenChange,
  classData,
}: EditClassDialogProps) {
  const { toast } = useToast();
  const updateClass = useUpdateClass();
  const { data: teachersData } = useTeachers();
  const teachers = teachersData?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    level: "",
    class_teacher_id: "",
    second_class_teacher_id: "",
    status: "active" as "active" | "inactive",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name || "",
        level: classData.level || "",
        class_teacher_id: classData.class_teacher_id?.toString() || "",
        second_class_teacher_id:
          (classData as any).second_class_teacher_id?.toString() || "",
        status: classData.status || "active",
      });
    }
  }, [classData]);

  const handleSubmit = async () => {
    if (!classData) return;

    if (!formData.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateClass.mutateAsync({
        id: classData.id,
        data: {
          name: formData.name,
          level: formData.level || undefined,
          class_teacher_id: formData.class_teacher_id
            ? parseInt(formData.class_teacher_id)
            : null,
          second_class_teacher_id: formData.second_class_teacher_id
            ? parseInt(formData.second_class_teacher_id)
            : null,
          status: formData.status,
        },
      });

      toast({
        title: "Success",
        description: "Class updated successfully.",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update class.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Update class information and reassign teacher
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Class Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., JSS 1A"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input
              id="level"
              placeholder="e.g., JSS 1, Primary 3, Nursery 2"
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class_teacher_id">Class Teacher 1</Label>
            <Select
              value={formData.class_teacher_id || "none"}
              onValueChange={(value) =>
                setFormData({ ...formData, class_teacher_id: value })
              }
            >
              <SelectTrigger id="class_teacher_id">
                <SelectValue placeholder="Select teacher (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {teachers
                  .filter(
                    (teacher) =>
                      teacher.id.toString() !== formData.second_class_teacher_id
                  )
                  .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.user?.name || teacher.teacher_id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="second_class_teacher_id">
              Class Teacher 2 (Optional)
            </Label>
            <Select
              value={formData.second_class_teacher_id || "none"}
              onValueChange={(value) =>
                setFormData({ ...formData, second_class_teacher_id: value })
              }
            >
              <SelectTrigger id="second_class_teacher_id">
                <SelectValue placeholder="Select teacher (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {teachers
                  .filter(
                    (teacher) =>
                      teacher.id.toString() !== formData.class_teacher_id
                  )
                  .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.user?.name || teacher.teacher_id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
