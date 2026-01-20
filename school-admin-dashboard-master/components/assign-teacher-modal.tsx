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
import {
  useAssignTeacher,
  useBulkAssignTeacher,
} from "@/hooks/use-teacher-assignments";
import { useSubjects } from "@/hooks/use-subjects";
import { useClasses } from "@/hooks/use-classes";
import { useToast } from "@/hooks/use-toast";
import { Add, CloseSquare } from "iconsax-react";
import { Card } from "@/components/ui/card";

interface AssignTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: number;
  teacherName: string;
}

interface Assignment {
  subject_id: number;
  class_id: number;
}

export default function AssignTeacherModal({
  open,
  onOpenChange,
  teacherId,
  teacherName,
}: AssignTeacherModalProps) {
  const { toast } = useToast();
  const assignTeacher = useAssignTeacher();
  const bulkAssign = useBulkAssignTeacher();
  const { data: subjectsData } = useSubjects();
  const { data: classesData } = useClasses();

  const subjects = subjectsData?.data || [];
  const classes = classesData?.data || [];

  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const handleAddAssignment = () => {
    setAssignments([
      ...assignments,
      {
        subject_id: 0,
        class_id: 0,
      },
    ]);
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleAssignmentChange = (
    index: number,
    field: "subject_id" | "class_id",
    value: string
  ) => {
    const updated = [...assignments];
    updated[index] = {
      ...updated[index],
      [field]: parseInt(value),
    };
    setAssignments(updated);
  };

  const handleSubmit = async () => {
    if (assignments.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one assignment.",
        variant: "destructive",
      });
      return;
    }

    const invalidAssignments = assignments.some(
      (a) =>
        !a.subject_id || !a.class_id || a.subject_id === 0 || a.class_id === 0
    );

    if (invalidAssignments) {
      toast({
        title: "Error",
        description:
          "Please select both subject and class for all assignments.",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkAssign.mutateAsync({
        teacher_id: teacherId,
        assignments: assignments,
      });

      toast({
        title: "Success",
        description: "Teacher assignments updated successfully.",
      });

      onOpenChange(false);
      setAssignments([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to assign teacher.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Teacher to Subjects & Classes</DialogTitle>
          <DialogDescription>
            Assign {teacherName} to teach specific subjects in classes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Assignments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAssignment}
                className="gap-2"
              >
                <Add size={16} />
                Add Assignment
              </Button>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assignments added. Click "Add Assignment" to get started.
              </div>
            ) : (
              assignments.map((assignment, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Subject <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={
                          assignment.subject_id > 0
                            ? assignment.subject_id.toString()
                            : ""
                        }
                        onValueChange={(value) =>
                          handleAssignmentChange(index, "subject_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={subject.id.toString()}
                            >
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Class <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={
                            assignment.class_id > 0
                              ? assignment.class_id.toString()
                              : ""
                          }
                          onValueChange={(value) =>
                            handleAssignmentChange(index, "class_id", value)
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem
                                key={cls.id}
                                value={cls.id.toString()}
                              >
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(index)}
                          className="text-destructive"
                        >
                          <CloseSquare size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setAssignments([]);
            }}
            disabled={bulkAssign.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={bulkAssign.isPending}>
            {bulkAssign.isPending ? "Assigning..." : "Assign Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
