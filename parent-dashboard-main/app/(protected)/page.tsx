"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSelector } from "@/components/student-selector";
import { Book, TrendUp, UserSquare, Calendar } from "iconsax-react";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";
import { useGrades } from "@/hooks/use-grades";
import { useAttendance } from "@/hooks/use-attendance";
import { useLanguage } from "@/context/language-context";

export default function Dashboard() {
  const { data: studentsData, isLoading } = useStudents();
  const { user } = useAuth();
  const { t } = useLanguage();
  const students = studentsData?.data || [];
  const [selectedStudentId, setSelectedStudentId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Fetch grades and attendance for selected student
  const { data: gradesData } = useGrades(
    selectedStudentId ? { student_id: selectedStudentId } : undefined
  );
  const { data: attendanceData } = useAttendance(
    selectedStudentId ? { student_id: selectedStudentId } : undefined
  );

  // Calculate average grade
  const grades = gradesData?.data || [];
  const averageGrade =
    grades.length > 0
      ? (
          grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length
        ).toFixed(1)
      : "N/A";

  // Calculate attendance percentage
  const attendances = attendanceData?.data || [];
  const presentCount = attendances.filter((a) => a.status === "present").length;
  const attendancePercentage =
    attendances.length > 0
      ? Math.round((presentCount / attendances.length) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t("dashboard.welcome")}, {user?.name || t("common.parent")}!
        </h1>
        <p className="text-slate-600 mt-2">
          {t("dashboard.childrenProgress") || "Here's an overview of your children's academic progress"}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">
          {t("common.loading")}
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8 text-slate-500">{t("dashboard.noStudents") || "No students found"}</div>
      ) : (
        <>
          {/* Student Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <Card
                key={student.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStudentId === student.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedStudentId(student.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Image
                      src={student.user?.avatar || "/placeholder.svg"}
                      alt={student.user?.name || "Student"}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {student.user?.name || "N/A"}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">
                        {student.class?.name || "No Class"}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className="font-bold text-slate-900">
                            {student.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Student ID</p>
                          <p className="font-bold text-slate-900">
                            {student.student_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {selectedStudent && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedStudent.user?.name}'s Overview
            </h2>
            <StudentSelector
              selectedStudentId={selectedStudentId}
              onSelect={setSelectedStudentId}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Average Grade</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {averageGrade}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendUp
                      size={20}
                      className="text-blue-600"
                      color="#155dfc"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Attendance</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {attendancePercentage}%
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar
                      size={20}
                      color="oklch(62.7% 0.194 149.214)"
                      className="text-green-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Class</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedStudent.class?.name || "N/A"}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Book size={20} color="oklch(64.6% 0.222 41.116)" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedStudent.status}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserSquare size={20} color="#9810fa" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
