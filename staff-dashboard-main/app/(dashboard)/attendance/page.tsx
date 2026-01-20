"use client";

import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
import { useBulkCreateAttendance } from "@/hooks/use-attendance";
import { useAuth } from "@/context/auth-context";
import { useTeacherAssignedClasses } from "@/hooks/use-teacher-assignments";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { format } from "date-fns";

export default function AttendancePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherId = user?.teacher?.id;
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(
    undefined
  );

  const { data: availableClasses = [] } = useTeacherAssignedClasses(teacherId);
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    class_id: selectedClassId,
    status: "active",
  });

  const bulkCreateAttendance = useBulkCreateAttendance();

  const [attendance, setAttendance] = useState<
    Record<number, "present" | "absent" | "late" | "excused">
  >({});

  const students = studentsData?.data || [];
  const today = format(new Date(), "yyyy-MM-dd");

  const presentCount = Object.values(attendance).filter(
    (status) => status === "present"
  ).length;
  const absentCount = Object.values(attendance).filter(
    (status) => status === "absent"
  ).length;

  const handleSave = async () => {
    if (!selectedClassId) {
      toast({
        title: t("common.error"),
        description: t("attendance.selectClassFirst") || "Please select a class first",
        variant: "destructive",
      });
      return;
    }

    if (students.length === 0) {
      toast({
        title: t("common.error"),
        description: t("attendance.noStudentsInClass") || "No students found for this class",
        variant: "destructive",
      });
      return;
    }

    const attendanceData = students.map((student) => ({
      student_id: student.id,
      status:
        attendance[student.id] ||
        ("absent" as "present" | "absent" | "late" | "excused"),
    }));

    bulkCreateAttendance.mutate(
      {
        class_id: selectedClassId,
        date: today,
        attendances: attendanceData,
      },
      {
        onSuccess: () => {
          toast({
            title: t("common.success"),
            description: t("attendance.attendanceMarked"),
          });
        },
        onError: (error: any) => {
          toast({
            title: t("common.error"),
            description:
              error.response?.data?.message || t("attendance.saveFailed") || "Failed to save attendance",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleClear = () => {
    setAttendance({});
  };

  const handleStatusChange = (
    studentId: number,
    status: "present" | "absent" | "late" | "excused"
  ) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("attendance.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("attendance.markAttendanceDescription") || "Mark attendance for your assigned classes"} -{" "}
          {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg p-6 border border-border"
      >
        <div className="space-y-2">
          <Label>{t("attendance.selectClass")}</Label>
          <Select
            value={selectedClassId?.toString() || ""}
            onValueChange={(value) =>
              setSelectedClassId(value ? parseInt(value) : undefined)
            }
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder={t("attendance.selectClass")} />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground">{t("attendance.present")}</p>
          <p className="text-3xl font-bold text-green-600">{presentCount}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground">{t("attendance.absent")}</p>
          <p className="text-3xl font-bold text-orange-600">{absentCount}</p>
        </div>
      </motion.div>

      {studentsLoading ? (
        <div className="text-center py-8">{t("common.loading")}</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    {t("common.student")} {t("common.name")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    {t("common.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      {selectedClassId
                        ? t("attendance.noStudents")
                        : t("attendance.selectClassToView") || "Select a class to view students"}
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <motion.tr
                      key={student.id}
                      whileHover={{ backgroundColor: "var(--secondary)" }}
                      className="border-b border-border last:border-0 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {student.user?.name || `Student ${student.student_id}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={attendance[student.id] === "present"}
                            onCheckedChange={(checked) =>
                              handleStatusChange(
                                student.id,
                                checked ? "present" : "absent"
                              )
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {attendance[student.id] === "present"
                              ? t("attendance.present")
                              : attendance[student.id] === "late"
                              ? t("attendance.late")
                              : attendance[student.id] === "excused"
                              ? t("attendance.excused")
                              : t("attendance.absent")}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-secondary border-t border-border flex gap-3">
            <Button
              onClick={handleSave}
              disabled={bulkCreateAttendance.isPending || students.length === 0}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {bulkCreateAttendance.isPending ? t("common.saving") : t("attendance.saveAttendance") || "Save Attendance"}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="px-4 py-2 bg-secondary text-foreground border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              {t("common.clearAll") || "Clear All"}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
