"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import StudentsTable from "@/components/students-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Add, ArrowDown2 } from "iconsax-react";
import { useState } from "react";
import AddStudentModal from "@/components/add-student-modal";
import { useLanguage } from "@/context/language-context";
import { studentsApi } from "@/lib/api/students";
import { useToast } from "@/hooks/use-toast";

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [academicSession, setAcademicSession] = useState("2024/2025");
  const [isDownloading, setIsDownloading] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleDownloadCsv = async () => {
    setIsDownloading(true);
    try {
      const blob = await studentsApi.downloadCsv(academicSession);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students_${academicSession.replace("/", "_")}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "CSV file downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to download CSV.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <TopNav />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {t("students.title")}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {t("students.manageStudents") ||
                      "Manage all students and their information"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Select
                      value={academicSession}
                      onValueChange={setAcademicSession}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                        <SelectItem value="2023/2024">2023/2024</SelectItem>
                        <SelectItem value="2025/2026">2025/2026</SelectItem>
                        <SelectItem value="2026/2027">2026/2027</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleDownloadCsv}
                      variant="outline"
                      className="gap-2"
                      disabled={isDownloading}
                    >
                      <ArrowDown2 size={18} />
                      {isDownloading ? "Downloading..." : "Download CSV"}
                    </Button>
                  </div>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="gap-2"
                  >
                    <Add size={18} color="white" />
                    {t("students.addStudent")}
                  </Button>
                </div>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{t("students.studentList")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <StudentsTable />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        <AddStudentModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
    </div>
  );
}
