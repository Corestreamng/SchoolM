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
import { useUpdateSubject } from "@/hooks/use-subjects";
import { useToast } from "@/hooks/use-toast";
import { Subject } from "@/lib/api/subjects";

interface EditSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
}

export default function EditSubjectModal({
  open,
  onOpenChange,
  subject,
}: EditSubjectModalProps) {
  const { toast } = useToast();
  const updateSubject = useUpdateSubject();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || "",
        code: subject.code || "",
        description: subject.description || "",
        status: subject.status || "active",
      });
    }
  }, [subject]);

  const handleSubmit = async () => {
    if (!subject) return;

    if (!formData.name || !formData.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSubject.mutateAsync({
        id: subject.id,
        data: {
          name: formData.name,
          code: formData.code,
          description: formData.description || undefined,
          status: formData.status,
        },
      });

      toast({
        title: "Success",
        description: "Subject updated successfully.",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update subject.",
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
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>Update subject information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Subject Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Subject Code</Label>
            <Input
              id="code"
              placeholder="e.g., MATH"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Subject description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
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
            {isSubmitting ? "Updating..." : "Update Subject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
