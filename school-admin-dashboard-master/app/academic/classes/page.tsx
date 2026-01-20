"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { More, Trash, Eye, SearchNormal, Edit, Add } from "iconsax-react";
import { useState } from "react";
import AddClassModal from "@/components/add-class-modal";
import ViewStudentsDialog from "@/components/view-students-dialog";
import EditClassDialog from "@/components/edit-class-dialog";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";
import { useClasses, useDeleteClass } from "@/hooks/use-classes";
import { useStudents } from "@/hooks/use-students";
import { Skeleton } from "@/components/ui/skeleton";
import { SchoolClass } from "@/lib/api/classes";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>("all");
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: classesData, isLoading } = useClasses({
    status: filterStatus && filterStatus !== "all" ? filterStatus : undefined,
  });
  const deleteClass = useDeleteClass();
  const { data: studentsData } = useStudents();

  const classes = classesData?.data || [];
  const students = studentsData?.data || [];

  const getStudentCountForClass = (classId: number) => {
    return students.filter((s) => s.class_id === classId).length;
  };

  const handleDeleteClick = (id: number) => {
    setClassToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;

    try {
      await deleteClass.mutateAsync(classToDelete);
      toast({
        title: t("common.success"),
        description: t("classes.classDeleted"),
      });
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("classes.deleteFailed") || "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const statusColors = {
    active: "bg-green-500/20 text-green-700",
    inactive: "bg-gray-500/20 text-gray-700",
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <TopNav />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {t("classes.title")}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {t("classes.manageClasses") ||
                      "Manage school classes and assignments"}
                  </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                  <Add size={18} color="white" />
                  {t("classes.addClass")}
                </Button>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{t("classes.classList")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={filterStatus || "all"}
                    onValueChange={(value) => setFilterStatus(value)}
                  >
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue
                        placeholder={
                          t("common.filter") +
                          " " +
                          t("common.status").toLowerCase()
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("common.all")} {t("common.status")}
                      </SelectItem>
                      <SelectItem value="active">
                        {t("common.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("common.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>{t("common.className")}</TableHead>
                            <TableHead>{t("common.code")}</TableHead>
                            <TableHead>{t("classes.classTeacher")}</TableHead>
                            <TableHead>{t("common.student")}s</TableHead>
                            <TableHead>{t("common.status")}</TableHead>
                            <TableHead className="w-10">
                              {t("common.actions")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classes.length > 0 ? (
                            classes.map((cls) => {
                              const studentCount = getStudentCountForClass(
                                cls.id
                              );
                              return (
                                <TableRow
                                  key={cls.id}
                                  className="hover:bg-muted/50 transition-colors"
                                >
                                  <TableCell className="font-medium">
                                    {cls.name}
                                  </TableCell>
                                  <TableCell className="text-sm font-mono text-muted-foreground">
                                    {cls.code}
                                  </TableCell>
                                  <TableCell>
                                    {cls.class_teacher?.user?.name || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {studentCount}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        statusColors[cls.status] ||
                                        statusColors.inactive
                                      }
                                    >
                                      {cls.status}
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
                                            setSelectedClass(cls);
                                            setIsViewStudentsOpen(true);
                                          }}
                                        >
                                          <Eye size={16} color="black" />
                                          {t("classes.viewStudents")}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="gap-2 cursor-pointer"
                                          onClick={() => {
                                            setSelectedClass(cls);
                                            setIsEditClassOpen(true);
                                          }}
                                        >
                                          <Edit size={16} color="black" />
                                          {t("common.edit")}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="gap-2 cursor-pointer text-destructive"
                                          onClick={() =>
                                            handleDeleteClick(cls.id)
                                          }
                                        >
                                          <Trash size={16} color="red" />
                                          {t("common.delete")}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-8 text-muted-foreground"
                              >
                                {t("classes.noClasses")}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <AddClassModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <ViewStudentsDialog
        open={isViewStudentsOpen}
        onOpenChange={setIsViewStudentsOpen}
        classData={selectedClass}
      />
      <EditClassDialog
        open={isEditClassOpen}
        onOpenChange={setIsEditClassOpen}
        classData={selectedClass}
      />
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t("classes.confirmDelete") || "Are you sure?"}
        description={
          t("classes.confirmDeleteDescription") ||
          "This will permanently delete this class. This action cannot be undone."
        }
      />
    </AuthGuard>
  );
}
