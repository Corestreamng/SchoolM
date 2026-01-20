"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useCreateSubject } from "@/hooks/use-subjects";
import { useToast } from "@/hooks/use-toast";

interface AddSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddSubjectModal({
  open,
  onOpenChange,
}: AddSubjectModalProps) {
  const { toast } = useToast();
  const createSubject = useCreateSubject();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
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
      await createSubject.mutateAsync({
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        status: "active",
      });

      toast({
        title: "Success",
        description: "Subject created successfully.",
      });

      onOpenChange(false);
      setFormData({
        name: "",
        code: "",
        description: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to create subject.",
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
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Create a new subject for the school curriculum
          </DialogDescription>
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
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
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
            {isSubmitting ? "Creating..." : "Add Subject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
