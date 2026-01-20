"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  More,
  SearchNormal,
  Trash,
  Eye,
  UserSquare,
  Edit,
} from "iconsax-react";
import { Badge } from "@/components/ui/badge";
import {
  useStudents,
  useDeleteStudent,
  useUpdateStudent,
} from "@/hooks/use-students";
import { useClasses } from "@/hooks/use-classes";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";
import ViewStudentModal from "@/components/view-student-modal";
import AssignClassModal from "@/components/assign-class-modal";
import EditStudentModal from "@/components/edit-student-modal";
import { useToast } from "@/hooks/use-toast";

export default function StudentsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<string | null>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignClassModalOpen, setAssignClassModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    search: searchTerm || undefined,
    class_id:
      filterClass && filterClass !== "all" ? parseInt(filterClass) : undefined,
  });

  const { data: classesData } = useClasses();
  const deleteStudent = useDeleteStudent();
  const updateStudent = useUpdateStudent();
  const { toast } = useToast();

  const students = studentsData?.data || [];
  const classes = classesData?.data || [];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchTerm ||
      student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      filterClass === "all" || student.class?.id?.toString() === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleDeleteClick = (id: number) => {
    setStudentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent.mutateAsync(studentToDelete);
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to delete student.",
        variant: "destructive",
      });
    }
  };

  const handleViewClick = (id: number) => {
    setSelectedStudentId(id);
    setViewModalOpen(true);
  };

  const handleEditClick = (id: number) => {
    setSelectedStudentId(id);
    setEditModalOpen(true);
  };

  const handleAssignClassClick = (id: number, name: string) => {
    setSelectedStudentId(id);
    setSelectedStudentName(name);
    setAssignClassModalOpen(true);
  };

  const handleSuspend = async (id: number, currentStatus: string) => {
    try {
      await updateStudent.mutateAsync({
        id,
        data: {
          status: currentStatus === "active" ? "suspended" : "active",
        },
      });
    } catch (error) {
      console.error("Failed to update student status:", error);
    }
  };

  const statusColors = {
    active: "bg-green-500/20 text-green-700",
    suspended: "bg-yellow-500/20 text-yellow-700",
    graduated: "bg-blue-500/20 text-blue-700",
    inactive: "bg-gray-500/20 text-gray-700",
  };

  if (isLoadingStudents) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <SearchNormal
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select
          value={filterClass || "all"}
          onValueChange={(value) => setFilterClass(value)}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id.toString()}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead className="w-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {student.user?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {student.user?.email || "N/A"}
                  </TableCell>
                  <TableCell>{student.class?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        statusColors[student.status] || statusColors.inactive
                      }`}
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {student.admission_date
                      ? new Date(student.admission_date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <More size={16} color="black" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => handleViewClick(student.id)}
                        >
                          <Eye size={16} color="black" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => handleEditClick(student.id)}
                        >
                          <Edit size={16} color="black" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() =>
                            handleAssignClassClick(
                              student.id,
                              student.user?.name || "Student"
                            )
                          }
                        >
                          <UserSquare size={16} color="black" />
                          Assign Class
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() =>
                            handleSuspend(student.id, student.status)
                          }
                        >
                          <span>
                            {student.status === "active"
                              ? "Suspend"
                              : "Activate"}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer text-destructive"
                          onClick={() => handleDeleteClick(student.id)}
                        >
                          <Trash size={16} color="black" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
      />

      {selectedStudentId && (
        <>
          <ViewStudentModal
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            studentId={selectedStudentId}
          />
          <EditStudentModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            studentId={selectedStudentId}
          />
          <AssignClassModal
            open={assignClassModalOpen}
            onOpenChange={setAssignClassModalOpen}
            studentId={selectedStudentId}
            studentName={selectedStudentName}
          />
        </>
      )}
    </div>
  );
}
