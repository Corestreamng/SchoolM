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
import { useCreateStudent } from "@/hooks/use-students";
import { useClasses } from "@/hooks/use-classes";
import { useParents } from "@/hooks/use-parents";
import { useToast } from "@/hooks/use-toast";

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddStudentModal({
  open,
  onOpenChange,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    classId: "",
    parentId: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    studentId: "",
  });
  const createStudent = useCreateStudent();
  const { data: classesData } = useClasses();
  const { data: parentsData } = useParents();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createStudent.mutateAsync({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || undefined,
        student_id: formData.studentId,
        date_of_birth: formData.dateOfBirth || undefined,
        gender: formData.gender as "male" | "female" | "other" | undefined,
        class_id: formData.classId ? parseInt(formData.classId) : undefined,
        parent_id: formData.parentId ? parseInt(formData.parentId) : undefined,
        status: "active",
      });
      toast({
        title: "Success",
        description: "Student created successfully",
      });
      onOpenChange(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        classId: "",
        parentId: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        studentId: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to create student",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the student details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
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
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Adekunle"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div> */}

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
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="studentId">Student ID *</Label>
            <Input
              id="studentId"
              placeholder="STU001"
              value={formData.studentId}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
            />
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select
              value={formData.classId}
              onValueChange={(value) =>
                setFormData({ ...formData, classId: value })
              }
            >
              <SelectTrigger id="class">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classesData?.data?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name} ({cls.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent</Label>
            <Select
              value={formData.parentId}
              onValueChange={(value) =>
                setFormData({ ...formData, parentId: value })
              }
            >
              <SelectTrigger id="parent">
                <SelectValue placeholder="Select a parent (optional)" />
              </SelectTrigger>
              <SelectContent>
                {parentsData?.data?.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id.toString()}>
                    {parent.user?.name || parent.parent_id} -{" "}
                    {parent.user?.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createStudent.isPending}>
            {createStudent.isPending ? "Adding..." : "Add Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
