"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/app/dashboard-layout";
import { useAttendance } from "@/hooks/use-attendance";
import { useAuth } from "@/hooks/use-auth";
import { format, startOfMonth, endOfMonth } from "date-fns";

const statusConfig = {
  present: {
    label: "Present",
    color: "bg-green-100 text-green-800",
    dot: "bg-green-500",
  },
  absent: {
    label: "Absent",
    color: "bg-red-100 text-red-800",
    dot: "bg-red-500",
  },
  late: {
    label: "Late",
    color: "bg-orange-100 text-orange-800",
    dot: "bg-orange-500",
  },
  excused: {
    label: "Excused",
    color: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function AttendancePage() {
  const { user } = useAuth();
  const studentId = user?.student?.id;

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const { data: attendanceData, isLoading } = useAttendance(
    studentId
      ? {
          student_id: studentId,
          date_from: format(monthStart, "yyyy-MM-dd"),
          date_to: format(monthEnd, "yyyy-MM-dd"),
          per_page: 1000,
        }
      : undefined
  );

  const attendances = attendanceData?.data || [];

  const stats = {
    present: attendances.filter((a) => a.status === "present").length,
    absent: attendances.filter((a) => a.status === "absent").length,
    late: attendances.filter((a) => a.status === "late").length,
    excused: attendances.filter((a) => a.status === "excused").length,
  };

  const totalRecords = attendances.length;
  const attendancePercentage =
    totalRecords > 0
      ? Math.round(((stats.present + stats.excused) / totalRecords) * 100)
      : 0;

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={cardVariants}>
          <div>
            <h1 className="text-3xl font-bold mb-2">Attendance</h1>
            <p className="text-muted-foreground">
              Your attendance records and summary
            </p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div variants={cardVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Overall</p>
                  <p className="text-3xl font-bold text-primary">
                    {attendancePercentage}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Attendance Rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {Object.entries(stats).map(([key, value]) => (
            <motion.div key={key} variants={cardVariants}>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1 capitalize">
                      {key}
                    </p>
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalRecords > 0
                        ? ((value / totalRecords) * 100).toFixed(0)
                        : 0}
                      %
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Attendance History */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading attendance...
                </div>
              ) : attendances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records available
                </div>
              ) : (
                <div className="space-y-2">
                  {attendances.slice(0, 20).map((attendance) => (
                    <motion.div
                      key={attendance.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            statusConfig[
                              attendance.status as keyof typeof statusConfig
                            ]?.dot || "bg-gray-500"
                          }`}
                        />
                        <div>
                          <p className="font-semibold">
                            {attendance.class?.name || "Class"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              new Date(attendance.date),
                              "EEEE, MMMM d, yyyy"
                            )}
                          </p>
                          {attendance.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {attendance.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={
                          statusConfig[
                            attendance.status as keyof typeof statusConfig
                          ]?.color || "bg-gray-100 text-gray-800"
                        }
                      >
                        {statusConfig[
                          attendance.status as keyof typeof statusConfig
                        ]?.label || attendance.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Legend */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${config.dot}`} />
                    <span className="text-sm text-muted-foreground">
                      {config.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
