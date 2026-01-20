"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSelector } from "@/components/student-selector";
import { useState, useEffect } from "react";
import { useAttendance } from "@/hooks/use-attendance";
import { useStudents } from "@/hooks/use-students";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

const statusColors = {
  present: "bg-green-100",
  absent: "bg-red-100",
  late: "bg-orange-100",
  excused: "bg-yellow-100",
};

const statusTextColors = {
  present: "text-green-700",
  absent: "text-red-700",
  late: "text-orange-700",
  excused: "text-yellow-700",
};

export default function Attendance() {
  const { data: studentsData } = useStudents();
  const students = studentsData?.data || [];
  const [selectedStudentId, setSelectedStudentId] = useState<
    number | undefined
  >(undefined);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  const { data: attendanceData, isLoading } = useAttendance(
    selectedStudentId
      ? {
          student_id: selectedStudentId,
          date_from: format(monthStart, "yyyy-MM-dd"),
          date_to: format(monthEnd, "yyyy-MM-dd"),
          per_page: 1000,
        }
      : undefined
  );

  const attendances = attendanceData?.data || [];
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const stats = {
    present: attendances.filter((a) => a.status === "present").length,
    absent: attendances.filter((a) => a.status === "absent").length,
    late: attendances.filter((a) => a.status === "late").length,
    excused: attendances.filter((a) => a.status === "excused").length,
  };

  // Create calendar days
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a map of date to attendance status
  const attendanceMap = new Map(
    attendances.map((a) => [format(new Date(a.date), "yyyy-MM-dd"), a.status])
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Attendance Monitoring
        </h1>
        <p className="text-slate-600 mt-2">Track monthly attendance records</p>
      </div>

      <div className="flex justify-between items-center">
        <input
          type="month"
          value={format(selectedMonth, "yyyy-MM")}
          onChange={(e) => setSelectedMonth(new Date(e.target.value + "-01"))}
          className="px-4 py-2 border border-slate-200 rounded-lg"
        />
        <StudentSelector
          selectedStudentId={selectedStudentId}
          onSelect={setSelectedStudentId}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-1">Present</p>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            <p className="text-xs text-slate-400 mt-2">days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-xs text-slate-400 mt-2">days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-1">Late</p>
            <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
            <p className="text-xs text-slate-400 mt-2">days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-1">Excused</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.excused}
            </p>
            <p className="text-xs text-slate-400 mt-2">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>{format(selectedMonth, "MMMM yyyy")} Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              Loading attendance...
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-xs text-slate-500 py-2"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const status = attendanceMap.get(dateStr);
                const dayOfWeek = day.getDay();
                const offset = idx === 0 ? dayOfWeek : 0;

                return (
                  <div
                    key={idx}
                    style={{
                      gridColumnStart: idx === 0 ? dayOfWeek + 1 : undefined,
                    }}
                    className={`aspect-square flex items-center justify-center rounded-lg font-medium text-sm ${
                      status
                        ? `${
                            statusColors[status as keyof typeof statusColors]
                          } ${
                            statusTextColors[
                              status as keyof typeof statusTextColors
                            ]
                          }`
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {attendances.slice(0, 10).map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {format(new Date(attendance.date), "EEEE, MMMM d, yyyy")}
                  </p>
                  {attendance.notes && (
                    <p className="text-sm text-slate-500 mt-1">
                      {attendance.notes}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[attendance.status as keyof typeof statusColors]
                  } ${
                    statusTextColors[
                      attendance.status as keyof typeof statusTextColors
                    ]
                  }`}
                >
                  {attendance.status.charAt(0).toUpperCase() +
                    attendance.status.slice(1)}
                </span>
              </div>
            ))}
            {attendances.length === 0 && (
              <p className="text-center py-8 text-slate-500">
                No attendance records for this month
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
