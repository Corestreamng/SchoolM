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
import { useUpdateStudent, useStudent } from "@/hooks/use-students";
import { useClasses } from "@/hooks/use-classes";
import { useParents } from "@/hooks/use-parents";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
}

export default function EditStudentModal({
  open,
  onOpenChange,
  studentId,
}: EditStudentModalProps) {
  const { toast } = useToast();
  const updateStudent = useUpdateStudent();
  const { data: student, isLoading: isLoadingStudent } = useStudent(
    studentId || 0
  );
  const { data: classesData } = useClasses();
  const { data: parentsData } = useParents();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "male" as "male" | "female" | "other",
    class_id: "",
    parent_id: "",
    admission_date: "",
    status: "active" as "active" | "inactive" | "graduated" | "suspended",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.user?.name || "",
        email: student.user?.email || "",
        phone: student.user?.phone || "",
        date_of_birth: student.date_of_birth
          ? new Date(student.date_of_birth).toISOString().split("T")[0]
          : "",
        gender: student.gender || "male",
        class_id: student.class_id?.toString() || "",
        parent_id: student.parent_id?.toString() || "",
        admission_date: student.admission_date
          ? new Date(student.admission_date).toISOString().split("T")[0]
          : "",
        status: student.status || "active",
      });
    }
  }, [student]);

  const handleSubmit = async () => {
    if (!studentId) return;

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
      await updateStudent.mutateAsync({
        id: studentId,
        data: {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          date_of_birth: formData.date_of_birth || undefined,
          gender: formData.gender,
          class_id: formData.class_id ? parseInt(formData.class_id) : undefined,
          parent_id: formData.parent_id
            ? parseInt(formData.parent_id)
            : undefined,
          admission_date: formData.admission_date || undefined,
          status: formData.status,
        },
      });

      toast({
        title: "Success",
        description: "Student updated successfully.",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update student.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const classes = classesData?.data || [];
  const parents = parentsData?.data || [];

  if (isLoadingStudent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Loading Student</DialogTitle>
          </DialogHeader>

          <Skeleton className="h-64 w-full" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update student information</DialogDescription>
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

            {/* <div className="space-y-2">
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
            </div> */}

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
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "male" | "female" | "other") =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_id">Class</Label>
              <Select
                value={formData.class_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, class_id: value })
                }
              >
                <SelectTrigger id="class_id">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Class</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_id: value })
                }
              >
                <SelectTrigger id="parent_id">
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Parent</SelectItem>
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id.toString()}>
                      {parent.user?.name || `Parent ${parent.parent_id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admission_date">Admission Date</Label>
              <Input
                id="admission_date"
                type="date"
                value={formData.admission_date}
                onChange={(e) =>
                  setFormData({ ...formData, admission_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(
                  value: "active" | "inactive" | "graduated" | "suspended"
                ) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
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
            {isSubmitting ? "Updating..." : "Update Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
