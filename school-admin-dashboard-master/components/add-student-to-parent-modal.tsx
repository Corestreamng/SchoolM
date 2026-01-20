"use client";

import { Button } from "@/components/ui/button";
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
import { useStudents } from "@/hooks/use-students";
import { useUpdateStudent } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";

interface AddStudentToParentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: number;
  parentName: string;
}

export default function AddStudentToParentModal({
  open,
  onOpenChange,
  parentId,
  parentName,
}: AddStudentToParentModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const { data: studentsData } = useStudents();
  const updateStudent = useUpdateStudent();
  const { toast } = useToast();

  const students = studentsData?.data || [];
  // Filter out students that already have a parent
  const availableStudents = students.filter(
    (student) => !student.parent_id || student.parent_id === null
  );

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateStudent.mutateAsync({
        id: parseInt(selectedStudentId),
        data: { parent_id: parentId },
      });
      toast({
        title: "Success",
        description: "Student added to parent successfully",
      });
      onOpenChange(false);
      setSelectedStudentId("");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to add student to parent",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Add Student to {parentName}</DialogTitle>
          <DialogDescription>
            Select a student to link to this parent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
            >
              <SelectTrigger id="student">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.length > 0 ? (
                  availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.user?.name || student.student_id} -{" "}
                      {student.class?.name || "No class"}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No available students
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {availableStudents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                All students are already assigned to parents
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateStudent.isPending || !selectedStudentId}
          >
            {updateStudent.isPending ? "Adding..." : "Add Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
