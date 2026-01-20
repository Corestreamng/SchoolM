"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useStudent } from "@/hooks/use-students";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
}

export default function ViewStudentModal({
  open,
  onOpenChange,
  studentId,
}: ViewStudentModalProps) {
  const { data: student, isLoading } = useStudent(studentId);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <Skeleton className="h-64 w-full" />
        </DialogContent>
      </Dialog>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            View complete student information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{student.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-medium">{student.student_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{student.user?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {student.date_of_birth
                    ? new Date(student.date_of_birth).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">
                  {student.gender || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admission Date</p>
                <p className="font-medium">
                  {student.admission_date
                    ? new Date(student.admission_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    student.status === "active"
                      ? "default"
                      : student.status === "graduated"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {student.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Class Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Class Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-medium">
                  {student.class?.name || "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class Code</p>
                <p className="font-medium">{student.class?.code || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          {student.parent && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Parent Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Parent Name</p>
                  <p className="font-medium">
                    {student.parent.user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parent Email</p>
                  <p className="font-medium">
                    {student.parent.user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parent ID</p>
                  <p className="font-medium">{student.parent.parent_id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
