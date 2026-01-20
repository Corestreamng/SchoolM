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
import { useState, useEffect } from "react";
import { useClasses } from "@/hooks/use-classes";
import { useUpdateStudent, useStudent } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";

interface AssignClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number | null;
  studentName?: string;
}

export default function AssignClassModal({
  open,
  onOpenChange,
  studentId,
  studentName,
}: AssignClassModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const { data: classesData } = useClasses();
  const { data: student } = useStudent(studentId || 0);
  const updateStudent = useUpdateStudent();
  const { toast } = useToast();

  const classes = classesData?.data || [];

  useEffect(() => {
    if (student?.class_id) {
      setSelectedClassId(student.class_id.toString());
    } else {
      setSelectedClassId("");
    }
  }, [student, open]);

  const handleSubmit = async () => {
    if (!studentId) return;

    if (!selectedClassId) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateStudent.mutateAsync({
        id: studentId,
        data: { class_id: parseInt(selectedClassId) },
      });
      toast({
        title: "Success",
        description: "Class assigned to student successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to assign class to student",
        variant: "destructive",
      });
    }
  };

  const handleRemoveClass = async () => {
    if (!studentId) return;

    try {
      await updateStudent.mutateAsync({
        id: studentId,
        data: { class_id: null as any },
      });
      toast({
        title: "Success",
        description: "Class removed from student successfully",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to remove class from student",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Assign Class</DialogTitle>
          <DialogDescription>
            {studentName
              ? `Assign a class to ${studentName}`
              : "Select a class to assign to this student"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="class">Class *</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name} ({cls.code})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No classes available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {student?.class && (
              <p className="text-sm text-muted-foreground">
                Current class: {student.class.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {student?.class_id && (
              <Button
                variant="outline"
                onClick={handleRemoveClass}
                disabled={updateStudent.isPending}
                className="text-destructive hover:text-destructive"
              >
                Remove Class
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateStudent.isPending || !selectedClassId}
            >
              {updateStudent.isPending ? "Assigning..." : "Assign Class"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
