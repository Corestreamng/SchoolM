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
import { useState } from "react";
import { useCreateTeacher } from "@/hooks/use-teachers";
import { useToast } from "@/hooks/use-toast";

interface AddTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTeacherModal({
  open,
  onOpenChange,
}: AddTeacherModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialization: "",
    phone: "",
    qualification: "",
    teacherId: "",
    status: "active" as
      | "active"
      | "inactive"
      | "on_leave"
      | "cashier"
      | "staff",
  });
  const createTeacher = useCreateTeacher();
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
      await createTeacher.mutateAsync({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || undefined,
        teacher_id: formData.teacherId,
        qualification: formData.qualification || undefined,
        specialization: formData.specialization || undefined,
        status: formData.status,
      });
      toast({
        title: "Success",
        description: "Teacher created successfully",
      });
      onOpenChange(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        specialization: "",
        phone: "",
        qualification: "",
        teacherId: "",
        status: "active",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to create teacher",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Fill in the teacher details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Adeyemi"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Okonkwo"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="teacher@coreskool.edu"
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

          <div className="space-y-2">
            <Label htmlFor="teacherId">Staff ID</Label>
            <Input
              id="teacherId"
              placeholder="TCH001"
              value={formData.teacherId}
              onChange={(e) =>
                setFormData({ ...formData, teacherId: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              placeholder="Mathematics, Physics, etc."
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              placeholder="Bachelor of Science in Education"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createTeacher.isPending}>
            {createTeacher.isPending ? "Adding..." : "Add Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
