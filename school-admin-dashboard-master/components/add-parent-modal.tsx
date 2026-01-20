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
import { useCreateParent } from "@/hooks/use-parents";
import { useToast } from "@/hooks/use-toast";

interface AddParentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddParentModal({
  open,
  onOpenChange,
}: AddParentModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    parentId: "",
    occupation: "",
    relationship: "",
  });
  const createParent = useCreateParent();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createParent.mutateAsync({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || undefined,
        parent_id: formData.parentId,
        occupation: formData.occupation || undefined,
        relationship: formData.relationship || undefined,
      });
      toast({
        title: "Success",
        description: "Parent created successfully",
      });
      onOpenChange(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        parentId: "",
        occupation: "",
        relationship: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to create parent",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Add New Parent</DialogTitle>
          <DialogDescription>
            Fill in the parent details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="parent@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+234 800 000 0000"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="parentId">Parent ID *</Label>
            <Input
              id="parentId"
              placeholder="PAR001"
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
            />
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              placeholder="Engineer, Teacher, etc."
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
              placeholder="Father, Mother, Guardian"
              value={formData.relationship}
              onChange={(e) =>
                setFormData({ ...formData, relationship: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createParent.isPending}>
            {createParent.isPending ? "Adding..." : "Add Parent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
