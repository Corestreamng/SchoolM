"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudents } from "@/hooks/use-students";
import { Skeleton } from "@/components/ui/skeleton";
import { SchoolClass } from "@/lib/api/classes";

interface ViewStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: SchoolClass | null;
}

export default function ViewStudentsDialog({
  open,
  onOpenChange,
  classData,
}: ViewStudentsDialogProps) {
  const { data: studentsData, isLoading } = useStudents({
    class_id: classData?.id,
    status: "active",
  });

  const students = studentsData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Students in {classData?.name || "Class"}</DialogTitle>
          <DialogDescription>
            View all students enrolled in this class
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found in this class
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">
                        {student.student_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.user?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.user?.email || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            student.status === "active"
                              ? "bg-green-500/20 text-green-700"
                              : student.status === "inactive"
                              ? "bg-gray-500/20 text-gray-700"
                              : student.status === "suspended"
                              ? "bg-red-500/20 text-red-700"
                              : "bg-blue-500/20 text-blue-700"
                          }`}
                        >
                          {student.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
