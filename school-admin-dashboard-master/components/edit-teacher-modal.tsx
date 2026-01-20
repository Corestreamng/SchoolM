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
import { useUpdateTeacher, useTeacher } from "@/hooks/use-teachers";
import { useToast } from "@/hooks/use-toast";
import type { Teacher } from "@/lib/api/teachers";

interface EditTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: number | null;
}

export default function EditTeacherModal({
  open,
  onOpenChange,
  teacherId,
}: EditTeacherModalProps) {
  const { data: teacher } = useTeacher(teacherId || 0);
  const updateTeacher = useUpdateTeacher();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    teacherId: "",
    qualification: "",
    specialization: "",
    status: "active" as
      | "active"
      | "inactive"
      | "on_leave"
      | "cashier"
      | "staff",
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.user?.name || "",
        email: teacher.user?.email || "",
        phone: (teacher.user as any)?.phone || "",
        teacherId: teacher.teacher_id || "",
        qualification: teacher.qualification || "",
        specialization: teacher.specialization || "",
        status: teacher.status || "active",
      });
    }
  }, [teacher]);

  const handleSubmit = async () => {
    if (!teacherId) return;

    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTeacher.mutateAsync({
        id: teacherId,
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          teacher_id: formData.teacherId || undefined,
          qualification: formData.qualification || undefined,
          specialization: formData.specialization || undefined,
          status: formData.status,
        },
      });
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update teacher",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>Update teacher information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
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
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
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
          <Button onClick={handleSubmit} disabled={updateTeacher.isPending}>
            {updateTeacher.isPending ? "Updating..." : "Update Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
