"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  More,
  Trash,
  Eye,
  SearchNormal,
  Add,
  UserAdd,
  Edit,
} from "iconsax-react";
import { useState } from "react";
import { useParents, useDeleteParent } from "@/hooks/use-parents";
import { useToast } from "@/hooks/use-toast";
import ViewChildrenModal from "@/components/view-children-modal";
import AddParentModal from "@/components/add-parent-modal";
import EditParentModal from "@/components/edit-parent-modal";
import AddStudentToParentModal from "@/components/add-student-to-parent-modal";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";
import { AuthGuard } from "@/components/auth-guard";
import { useLanguage } from "@/context/language-context";

export default function ParentsPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddParentModalOpen, setIsAddParentModalOpen] = useState(false);
  const [isEditParentModalOpen, setIsEditParentModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState<number | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const { data, isLoading } = useParents({ search: searchTerm || undefined });
  const deleteParent = useDeleteParent();
  const { toast } = useToast();

  const handleDeleteClick = (id: number) => {
    setParentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!parentToDelete) return;
    try {
      await deleteParent.mutateAsync(parentToDelete);
      toast({
        title: t("common.success"),
        description: t("parents.parentDeleted"),
      });
      setIsDeleteDialogOpen(false);
      setParentToDelete(null);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description:
          error?.response?.data?.message ||
          t("parents.deleteFailed") ||
          "Failed to delete parent",
        variant: "destructive",
      });
    }
  };

  const handleAddStudentClick = (parentId: number, parentName: string) => {
    setSelectedParent({ id: parentId, name: parentName });
    setIsAddStudentModalOpen(true);
  };

  const parents = data?.data || [];

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
                    {t("parents.title")}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {t("parents.manageParents") ||
                      "Manage parent accounts and child linkages"}
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddParentModalOpen(true)}
                  className="gap-2"
                >
                  <Add size={18} color="white" />
                  {t("parents.addParent")}
                </Button>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{t("parents.parentList")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <SearchNormal
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      placeholder={
                        t("parents.searchPlaceholder") ||
                        "Search by name or email..."
                      }
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>{t("common.name")}</TableHead>
                          <TableHead>{t("common.email")}</TableHead>
                          <TableHead>{t("common.phone")}</TableHead>
                          <TableHead>{t("parents.children")}</TableHead>
                          <TableHead className="w-10">
                            {t("common.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-8 text-muted-foreground"
                            >
                              {t("common.loading")}
                            </TableCell>
                          </TableRow>
                        ) : parents.length > 0 ? (
                          parents.map((parent) => (
                            <TableRow
                              key={parent.id}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {parent.user?.name || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {parent.user?.email || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {parent.user?.phone || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {parent.students?.length || 0} child(ren)
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
                                        setSelectedParent({
                                          id: parent.id,
                                          name: parent.user?.name || "Parent",
                                        });
                                        setIsViewModalOpen(true);
                                      }}
                                    >
                                      <Eye size={16} color="black" />
                                      {t("parents.viewChildren")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="gap-2 cursor-pointer"
                                      onClick={() => {
                                        setSelectedParentId(parent.id);
                                        setIsEditParentModalOpen(true);
                                      }}
                                    >
                                      <Edit size={16} color="black" />
                                      {t("common.edit")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="gap-2 cursor-pointer"
                                      onClick={() =>
                                        handleAddStudentClick(
                                          parent.id,
                                          parent.user?.name || "Parent"
                                        )
                                      }
                                    >
                                      <UserAdd size={16} color="black" />
                                      {t("parents.addStudent")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="gap-2 cursor-pointer text-destructive"
                                      onClick={() =>
                                        handleDeleteClick(parent.id)
                                      }
                                    >
                                      <Trash size={16} color="black" />
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
                              colSpan={5}
                              className="text-center py-8 text-muted-foreground"
                            >
                              {t("parents.noParents")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        {selectedParent && (
          <>
            <ViewChildrenModal
              open={isViewModalOpen}
              onOpenChange={setIsViewModalOpen}
              parentId={selectedParent.id}
              parentName={selectedParent.name}
            />
            <AddStudentToParentModal
              open={isAddStudentModalOpen}
              onOpenChange={setIsAddStudentModalOpen}
              parentId={selectedParent.id}
              parentName={selectedParent.name}
            />
          </>
        )}

        <AddParentModal
          open={isAddParentModalOpen}
          onOpenChange={setIsAddParentModalOpen}
        />
        <EditParentModal
          open={isEditParentModalOpen}
          onOpenChange={setIsEditParentModalOpen}
          parentId={selectedParentId}
        />

        <DeleteConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title={t("parents.deleteParent")}
          description={
            t("parents.deleteConfirm") ||
            "Are you sure you want to delete this parent? This action cannot be undone."
          }
        />
      </div>
    </AuthGuard>
  );
}
