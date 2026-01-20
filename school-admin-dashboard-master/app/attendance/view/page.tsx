"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer } from "iconsax-react";
import { useAttendance } from "@/hooks/use-attendance";
import { useClasses } from "@/hooks/use-classes";
import { useStudents } from "@/hooks/use-students";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ViewAttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || new Date().toISOString().split("T")[0]
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(
    searchParams.get("class_id") || ""
  );

  useEffect(() => {
    const dateParam = searchParams.get("date");
    const classParam = searchParams.get("class_id");
    if (dateParam) setSelectedDate(dateParam);
    if (classParam) setSelectedClassId(classParam);
  }, [searchParams]);

  const { data: classesData } = useClasses();
  const { data: attendanceData, isLoading: isLoadingAttendance } =
    useAttendance(
      selectedClassId && selectedDate
        ? { class_id: parseInt(selectedClassId), date: selectedDate }
        : undefined
    );
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(
    selectedClassId ? { class_id: parseInt(selectedClassId) } : undefined
  );

  const classes = classesData?.data || [];
  const students = studentsData?.data || [];
  const attendanceRecords = attendanceData?.data || [];
  const selectedClass = classes.find(
    (c) => c.id.toString() === selectedClassId
  );

  // Create a map of attendance by student_id
  const attendanceMap = new Map(
    attendanceRecords.map((att) => [att.student_id, att])
  );

  // Combine students with their attendance
  const studentsWithAttendance = students.map((student) => ({
    ...student,
    attendance: attendanceMap.get(student.id),
  }));

  const presentCount = studentsWithAttendance.filter(
    (s) => s.attendance?.status === "present"
  ).length;
  const absentCount = studentsWithAttendance.filter(
    (s) => s.attendance?.status === "absent"
  ).length;
  const lateCount = studentsWithAttendance.filter(
    (s) => s.attendance?.status === "late"
  ).length;
  const excusedCount = studentsWithAttendance.filter(
    (s) => s.attendance?.status === "excused"
  ).length;
  const totalStudents = students.length;
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups for printing.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report - ${
            selectedClass?.name || "Class"
          } - ${selectedDate}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              direction: ltr;
            }
            .header-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
              text-align: center;
            }
            .header-section h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header-section .info {
              margin-top: 10px;
              font-size: 14px;
            }
            .stats-section {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 15px;
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .stat-card {
              border: 1px solid #ddd;
              padding: 15px;
              text-align: center;
              border-radius: 4px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            .status-present { color: #22c55e; font-weight: bold; }
            .status-absent { color: #ef4444; font-weight: bold; }
            .status-late { color: #eab308; font-weight: bold; }
            .status-excused { color: #3b82f6; font-weight: bold; }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              display: flex;
              justify-content: space-between;
            }
            .signature {
              width: 200px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
                    View Attendance
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    View and print attendance reports by class and date
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/attendance")}
                    className="gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </Button>
                  {selectedClassId && selectedDate && (
                    <Button onClick={handlePrint} className="gap-2">
                      <Printer size={18} />
                      Print PDF
                    </Button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Class</label>
                      <Select
                        value={selectedClassId}
                        onValueChange={setSelectedClassId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              {cls.name} ({cls.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedClassId && selectedDate && (
                <>
                  {isLoadingAttendance || isLoadingStudents ? (
                    <Skeleton className="h-96 w-full" />
                  ) : (
                    <div
                      ref={printRef}
                      className="bg-white p-8 border rounded-lg"
                    >
                      {/* Header Section */}
                      <div className="header-section mb-6">
                        <h1 className="text-2xl font-bold mb-2">
                          ATTENDANCE REPORT
                        </h1>
                        <div className="info">
                          <p>
                            <strong>Class:</strong>{" "}
                            {selectedClass?.name || "N/A"} (
                            {selectedClass?.code || "N/A"})
                          </p>
                          <p>
                            <strong>Date:</strong> {formatDate(selectedDate)}
                          </p>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="stats-section mb-6">
                        <div className="stat-card">
                          <div className="stat-value text-green-600">
                            {presentCount}
                          </div>
                          <div className="stat-label">Present</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value text-red-600">
                            {absentCount}
                          </div>
                          <div className="stat-label">Absent</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value text-yellow-600">
                            {lateCount}
                          </div>
                          <div className="stat-label">Late</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value text-blue-600">
                            {excusedCount}
                          </div>
                          <div className="stat-label">Excused</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value text-primary">
                            {attendanceRate}%
                          </div>
                          <div className="stat-label">Attendance Rate</div>
                        </div>
                      </div>

                      {/* Attendance Table */}
                      <table>
                        <thead>
                          <tr>
                            <th>S/N</th>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Status</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentsWithAttendance.length > 0 ? (
                            studentsWithAttendance.map((student, index) => (
                              <tr key={student.id}>
                                <td className="text-center">{index + 1}</td>
                                <td className="text-center">
                                  {student.student_id}
                                </td>
                                <td>{student.user?.name || "N/A"}</td>
                                <td className="text-center">
                                  <span
                                    className={`status-${
                                      student.attendance?.status || "absent"
                                    }`}
                                  >
                                    {student.attendance?.status
                                      ? student.attendance.status
                                          .charAt(0)
                                          .toUpperCase() +
                                        student.attendance.status.slice(1)
                                      : "Absent"}
                                  </span>
                                </td>
                                <td className="text-center">
                                  {student.attendance?.notes || "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="text-center py-8">
                                No attendance records found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* Footer with Signatures */}
                      <div className="footer">
                        <div className="signature">
                          <p className="text-sm">Class Teacher's Signature</p>
                        </div>
                        <div className="signature">
                          <p className="text-sm">Principal's Signature</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display Section (Non-printable) */}
                  {!isLoadingAttendance && !isLoadingStudents && (
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle>Attendance Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                          <div className="text-center p-4 bg-green-500/10 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                              {presentCount}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Present
                            </p>
                          </div>
                          <div className="text-center p-4 bg-red-500/10 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">
                              {absentCount}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Absent
                            </p>
                          </div>
                          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">
                              {lateCount}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Late
                            </p>
                          </div>
                          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                              {excusedCount}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Excused
                            </p>
                          </div>
                          <div className="text-center p-4 bg-primary/10 rounded-lg">
                            <p className="text-2xl font-bold text-primary">
                              {attendanceRate}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Rate
                            </p>
                          </div>
                        </div>

                        <div className="border border-border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead className="w-12">S/N</TableHead>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentsWithAttendance.length > 0 ? (
                                studentsWithAttendance.map((student, index) => (
                                  <TableRow key={student.id}>
                                    <TableCell className="text-center">
                                      {index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      {student.student_id}
                                    </TableCell>
                                    <TableCell>
                                      {student.user?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={
                                          student.attendance?.status ===
                                          "present"
                                            ? "bg-green-500/10 text-green-700 border-green-500/20"
                                            : student.attendance?.status ===
                                              "absent"
                                            ? "bg-red-500/10 text-red-700 border-red-500/20"
                                            : student.attendance?.status ===
                                              "late"
                                            ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                                            : "bg-blue-500/10 text-blue-700 border-blue-500/20"
                                        }
                                      >
                                        {student.attendance?.status
                                          ? student.attendance.status
                                              .charAt(0)
                                              .toUpperCase() +
                                            student.attendance.status.slice(1)
                                          : "Absent"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {student.attendance?.notes || "-"}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={5}
                                    className="text-center py-8 text-muted-foreground"
                                  >
                                    No attendance records found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {(!selectedClassId || !selectedDate) && (
                <Card className="bg-card border-border">
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      Please select a class and date to view attendance
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function ViewAttendancePage() {
  return <ViewAttendanceContent />;
}
