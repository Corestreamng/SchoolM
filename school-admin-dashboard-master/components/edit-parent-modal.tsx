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
import { useUpdateParent, useParent } from "@/hooks/use-parents";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface EditParentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: number | null;
}

export default function EditParentModal({
  open,
  onOpenChange,
  parentId,
}: EditParentModalProps) {
  const { toast } = useToast();
  const updateParent = useUpdateParent();
  const { data: parent, isLoading: isLoadingParent } = useParent(parentId || 0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
    relationship: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (parent) {
      setFormData({
        name: parent.user?.name || "",
        email: parent.user?.email || "",
        phone: parent.user?.phone || "",
        occupation: parent.occupation || "",
        relationship: parent.relationship || "",
      });
    }
  }, [parent]);

  const handleSubmit = async () => {
    if (!parentId) return;

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
      await updateParent.mutateAsync({
        id: parentId,
        data: {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          occupation: formData.occupation || undefined,
          relationship: formData.relationship || undefined,
        },
      });

      toast({
        title: "Success",
        description: "Parent updated successfully.",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update parent.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingParent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
          <Skeleton className="h-64 w-full" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Edit Parent</DialogTitle>
          <DialogDescription>Update parent information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                placeholder="Enter occupation"
                value={formData.occupation}
                onChange={(e) =>
                  setFormData({ ...formData, occupation: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                placeholder="e.g., Father, Mother, Guardian"
                value={formData.relationship}
                onChange={(e) =>
                  setFormData({ ...formData, relationship: e.target.value })
                }
              />
            </div>
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
            {isSubmitting ? "Updating..." : "Update Parent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
