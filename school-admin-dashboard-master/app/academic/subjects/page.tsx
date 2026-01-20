"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Add, More, Trash, Eye, SearchNormal, Edit } from "iconsax-react";
import { useState } from "react";
import { useSubjects, useDeleteSubject } from "@/hooks/use-subjects";
import { Skeleton } from "@/components/ui/skeleton";
import AddSubjectModal from "@/components/add-subject-modal";
import EditSubjectModal from "@/components/edit-subject-modal";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";
import { Subject } from "@/lib/api/subjects";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";

export default function SubjectsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<number | null>(null);
  const { data: subjectsData, isLoading } = useSubjects({
    search: searchTerm || undefined,
  });
  const deleteSubject = useDeleteSubject();

  const subjects = subjectsData?.data || [];

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: number) => {
    setSubjectToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      await deleteSubject.mutateAsync(subjectToDelete);
      toast({
        title: t("common.success"),
        description: t("subjects.subjectDeleted"),
      });
      setIsDeleteDialogOpen(false);
      setSubjectToDelete(null);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description:
          error?.response?.data?.message ||
          t("subjects.deleteFailed") ||
          "Failed to delete subject",
        variant: "destructive",
      });
    }
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
                    {t("subjects.title")}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {t("subjects.manageSubjects") ||
                      "Manage school subjects and teacher assignments"}
                  </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                  <Add size={18} color="white" />
                  {t("subjects.addSubject")}
                </Button>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{t("subjects.subjectList")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <SearchNormal
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                      color="grey"
                    />
                    <Input
                      placeholder={
                        t("subjects.searchPlaceholder") || "Search subjects..."
                      }
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>
                              {t("common.subject")} {t("common.name")}
                            </TableHead>
                            <TableHead>{t("common.code")}</TableHead>
                            <TableHead>{t("common.status")}</TableHead>
                            <TableHead className="w-10">
                              {t("common.actions")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSubjects.length > 0 ? (
                            filteredSubjects.map((subject) => (
                              <TableRow
                                key={subject.id}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell className="font-medium">
                                  {subject.name}
                                </TableCell>
                                <TableCell className="text-sm font-mono text-muted-foreground">
                                  {subject.code}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      subject.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {subject.status}
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
                                          setSelectedSubject(subject);
                                          setIsEditModalOpen(true);
                                        }}
                                      >
                                        <Edit size={16} color="black" />
                                        {t("common.edit")}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="gap-2 cursor-pointer text-destructive"
                                        onClick={() =>
                                          handleDeleteClick(subject.id)
                                        }
                                      >
                                        <Trash size={16} color="red" />
                                        {t("common.delete")}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="text-center py-8 text-muted-foreground"
                              >
                                {t("subjects.noSubjects")}
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

      <AddSubjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <EditSubjectModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        subject={selectedSubject}
      />
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t("subjects.confirmDelete") || "Are you sure?"}
        description={
          t("subjects.confirmDeleteDescription") ||
          "This will permanently delete this subject. This action cannot be undone."
        }
      />
    </AuthGuard>
  );
}
