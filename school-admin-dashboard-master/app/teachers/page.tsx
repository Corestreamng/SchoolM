"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import TeachersTable from "@/components/teachers-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Add } from "iconsax-react";
import { useState } from "react";
import AddTeacherModal from "@/components/add-teacher-modal";
import { useLanguage } from "@/context/language-context";

export default function TeachersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

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
                    {t("teachers.title")}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {t("teachers.manageTeachers") ||
                      "Manage all teachers and their assignments"}
                  </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                  <Add size={18} color="white" />
                  {t("teachers.addTeacher")}
                </Button>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{t("teachers.teacherList")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TeachersTable />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        <AddTeacherModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
    </AuthGuard>
  );
}
