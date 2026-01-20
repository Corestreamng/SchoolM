"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { SearchNormal, Save2, Eye } from "iconsax-react";
import { useRouter } from "next/navigation";
import { useStudents } from "@/hooks/use-students";
import { useClasses } from "@/hooks/use-classes";
import { useAttendance, useBulkStoreAttendance } from "@/hooks/use-attendance";
import { useToast } from "@/hooks/use-toast";

interface StudentAttendance {
  id: number;
  student_id: number;
  name: string;
  rollNo: string;
  present: boolean;
}

export default function AttendancePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceState, setAttendanceState] = useState<
    Record<number, "present" | "absent" | "late" | "excused">
  >({});
  const { data: classesData } = useClasses();
  const { data: studentsData, isLoading: studentsLoading } = useStudents(
    selectedClassId ? { class_id: parseInt(selectedClassId) } : undefined
  );
  const { data: attendanceData } = useAttendance(
    selectedClassId && selectedDate
      ? { class_id: parseInt(selectedClassId), date: selectedDate }
      : undefined
  );
  const bulkStoreAttendance = useBulkStoreAttendance();
  const { toast } = useToast();

  const students = studentsData?.data || [];

  useEffect(() => {
    if (attendanceData?.data && students.length > 0) {
      const attendanceMap: Record<
        number,
        "present" | "absent" | "late" | "excused"
      > = {};
      attendanceData.data.forEach((att) => {
        attendanceMap[att.student_id] = att.status;
      });
      // Fill in missing students as present
      students.forEach((student) => {
        if (!attendanceMap[student.id]) {
          attendanceMap[student.id] = "present";
        }
      });
      setAttendanceState(attendanceMap);
    } else if (students.length > 0) {
      // Initialize all as present by default
      const defaultState: Record<
        number,
        "present" | "absent" | "late" | "excused"
      > = {};
      students.forEach((student) => {
        defaultState[student.id] = "present";
      });
      setAttendanceState(defaultState);
    }
  }, [attendanceData, students]);

  const filteredStudents = students.filter(
    (student) =>
      student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAttendanceChange = (
    studentId: number,
    status: "present" | "absent" | "late" | "excused"
  ) => {
    setAttendanceState({ ...attendanceState, [studentId]: status });
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedDate) {
      toast({
        title: "Error",
        description: "Please select a class and date",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkStoreAttendance.mutateAsync({
        class_id: parseInt(selectedClassId),
        date: selectedDate,
        attendances: students.map((student) => ({
          student_id: student.id,
          status: attendanceState[student.id] || "present",
        })),
      });
      toast({
        title: "Success",
        description: `Attendance saved successfully for ${students.length} student(s)`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to save attendance",
        variant: "destructive",
      });
    }
  };

  const presentCount = students.filter(
    (s) => attendanceState[s.id] === "present"
  ).length;
  const absentCount = students.filter(
    (s) => attendanceState[s.id] === "absent"
  ).length;
  const lateCount = students.filter(
    (s) => attendanceState[s.id] === "late"
  ).length;
  const excusedCount = students.filter(
    (s) => attendanceState[s.id] === "excused"
  ).length;
  const presentPercentage =
    students.length > 0
      ? Math.round((presentCount / students.length) * 100)
      : 0;

  const handleMarkAll = (status: "present" | "absent" | "late" | "excused") => {
    const newState: Record<number, "present" | "absent" | "late" | "excused"> =
      {};
    students.forEach((student) => {
      newState[student.id] = status;
    });
    setAttendanceState(newState);
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <TopNav />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Attendance
                </h1>
                <p className="text-muted-foreground mt-2">
                  Record and manage student and teacher attendance
                </p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      {classesData?.data?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name} ({cls.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full"
                    onClick={handleSaveAttendance}
                    disabled={bulkStoreAttendance.isPending || !selectedClassId}
                  >
                    {bulkStoreAttendance.isPending
                      ? "Saving..."
                      : "Save Attendance"}
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() =>
                      router.push(
                        `/attendance/view?class_id=${selectedClassId}&date=${selectedDate}`
                      )
                    }
                    disabled={!selectedClassId || !selectedDate}
                  >
                    <Eye size={18} />
                    View & Print
                  </Button>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {presentCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Present
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">
                        {absentCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Absent
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">
                        {lateCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Late</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {excusedCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Excused
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        {presentPercentage}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Attendance Rate
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Table */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Mark Attendance</CardTitle>
                    {selectedClassId && students.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAll("present")}
                        >
                          Mark All Present
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAll("absent")}
                        >
                          Mark All Absent
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <SearchNormal
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      placeholder="Search students..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-12">Roll #</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead className="w-40">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsLoading ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8">
                              Loading students...
                            </TableCell>
                          </TableRow>
                        ) : filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => {
                            const status =
                              attendanceState[student.id] || "present";
                            return (
                              <TableRow
                                key={student.id}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell className="font-medium">
                                  {student.student_id}
                                </TableCell>
                                <TableCell>
                                  {student.user?.name || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={status}
                                      onValueChange={(
                                        value:
                                          | "present"
                                          | "absent"
                                          | "late"
                                          | "excused"
                                      ) =>
                                        handleAttendanceChange(
                                          student.id,
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="w-36">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="present">
                                          Present
                                        </SelectItem>
                                        <SelectItem value="absent">
                                          Absent
                                        </SelectItem>
                                        <SelectItem value="late">
                                          Late
                                        </SelectItem>
                                        <SelectItem value="excused">
                                          Excused
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Badge
                                      variant="outline"
                                      className={
                                        status === "present"
                                          ? "bg-green-500/10 text-green-700 border-green-500/20"
                                          : status === "absent"
                                          ? "bg-red-500/10 text-red-700 border-red-500/20"
                                          : status === "late"
                                          ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                                          : "bg-blue-500/10 text-blue-700 border-blue-500/20"
                                      }
                                    >
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                    </Badge>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No students found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="gap-2"
                      onClick={handleSaveAttendance}
                      disabled={
                        bulkStoreAttendance.isPending || !selectedClassId
                      }
                    >
                      <Save2 size={18} />
                      {bulkStoreAttendance.isPending
                        ? "Saving..."
                        : "Save Attendance"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
