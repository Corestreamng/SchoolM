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
import { More, SearchNormal, Trash, Edit, UserAdd } from "iconsax-react";
import { Badge } from "@/components/ui/badge";
import {
  useTeachers,
  useDeleteTeacher,
  useUpdateTeacher,
} from "@/hooks/use-teachers";
import { useSubjects } from "@/hooks/use-subjects";
import { useClasses } from "@/hooks/use-classes";
import { Skeleton } from "@/components/ui/skeleton";
import AssignTeacherModal from "@/components/assign-teacher-modal";
import EditTeacherModal from "@/components/edit-teacher-modal";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import type { TeacherAssignment } from "@/lib/api/teachers";

export default function TeachersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState<string | null>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<number | null>(null);
  const [teacherToChangeStatus, setTeacherToChangeStatus] = useState<{
    id: number;
    currentStatus: string;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<string>("active");

  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({
    search: searchTerm || undefined,
  });

  const { data: subjectsData } = useSubjects();
  const { data: classesData } = useClasses();
  const deleteTeacher = useDeleteTeacher();
  const updateTeacher = useUpdateTeacher();
  const { toast } = useToast();

  const teachers = teachersData?.data || [];
  const subjects = subjectsData?.data || [];
  const classes = classesData?.data || [];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      !searchTerm ||
      teacher.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    // Note: Subject filtering would need to be implemented based on teacher-subject relationships
    return matchesSearch;
  });

  const handleDeleteClick = (id: number) => {
    setTeacherToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;
    try {
      await deleteTeacher.mutateAsync(teacherToDelete);
      toast({
        title: "Success",
        description: "Teacher deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setTeacherToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to delete teacher.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChangeClick = (id: number, currentStatus: string) => {
    setTeacherToChangeStatus({ id, currentStatus });
    setNewStatus(currentStatus);
    setIsStatusDialogOpen(true);
  };

  const handleStatusChangeConfirm = async () => {
    if (!teacherToChangeStatus) return;
    try {
      await updateTeacher.mutateAsync({
        id: teacherToChangeStatus.id,
        data: { status: newStatus as any },
      });
      toast({
        title: "Success",
        description: "Teacher status updated successfully.",
      });
      setIsStatusDialogOpen(false);
      setTeacherToChangeStatus(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (id: number) => {
    setSelectedTeacher({ id, name: "" });
    setIsEditModalOpen(true);
  };

  const statusColors = {
    active: "bg-green-500/20 text-green-700",
    inactive: "bg-gray-500/20 text-gray-700",
    on_leave: "bg-yellow-500/20 text-yellow-700",
    cashier: "bg-blue-500/20 text-blue-700",
    staff: "bg-purple-500/20 text-purple-700",
  };

  if (isLoadingTeachers) {
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={18}
              color="black"
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
          value={filterSubject || "all"}
          onValueChange={(value) => setFilterSubject(value || "all")}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.name}
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
              <TableHead>Subject</TableHead>
              <TableHead>Classes Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <TableRow
                  key={teacher.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {teacher.user?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {teacher.user?.email || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {teacher.assignments && teacher.assignments.length > 0 ? (
                        teacher.assignments.map(
                          (assignment: TeacherAssignment, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs w-fit"
                            >
                              {assignment.subject_name} ({assignment.class_name}
                              )
                            </Badge>
                          )
                        )
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No assignments
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {teacher.assignments && teacher.assignments.length > 0 ? (
                        Array.from(
                          new Set(
                            teacher.assignments.map(
                              (a: TeacherAssignment) => a.class_name
                            )
                          )
                        ).map((className: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs w-fit"
                          >
                            {className}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[
                          teacher.status as keyof typeof statusColors
                        ] || statusColors.inactive
                      }
                    >
                      {teacher.status}
                    </Badge>
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
                          onClick={() => {
                            setSelectedTeacher({
                              id: teacher.id,
                              name: teacher.user?.name || "Teacher",
                            });
                            setIsAssignModalOpen(true);
                          }}
                        >
                          <UserAdd size={16} />
                          Assign to Subject/Class
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => handleEditClick(teacher.id)}
                        >
                          <Edit size={16} />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() =>
                            handleStatusChangeClick(teacher.id, teacher.status)
                          }
                        >
                          <span>Change Status</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer text-destructive"
                          onClick={() => handleDeleteClick(teacher.id)}
                        >
                          <Trash size={16} />
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
                  No teachers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedTeacher && (
        <>
          <AssignTeacherModal
            open={isAssignModalOpen}
            onOpenChange={setIsAssignModalOpen}
            teacherId={selectedTeacher.id}
            teacherName={selectedTeacher.name}
          />
          <EditTeacherModal
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            teacherId={selectedTeacher.id}
          />
        </>
      )}

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Teacher"
        description="Are you sure you want to delete this teacher? This action cannot be undone."
      />

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Teacher Status</DialogTitle>
            <DialogDescription>
              Select the new status for this teacher
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
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
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusChangeConfirm}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
