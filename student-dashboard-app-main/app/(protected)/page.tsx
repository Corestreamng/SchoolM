"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useGrades } from "@/hooks/use-grades";
import { useAttendance } from "@/hooks/use-attendance";
import { useAssignments } from "@/hooks/use-assignments";
import { usePayments } from "@/hooks/use-payments";
import { useTimetables } from "@/hooks/use-timetables";
import { useLanguage } from "@/context/language-context";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const studentId = user?.student?.id;
  const classId = user?.student?.class_id;

  const { data: gradesData } = useGrades(
    studentId ? { student_id: studentId, per_page: 100 } : undefined
  );
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const { data: attendanceData } = useAttendance(
    studentId
      ? {
          student_id: studentId,
          date_from: format(monthStart, "yyyy-MM-dd"),
          date_to: format(monthEnd, "yyyy-MM-dd"),
          per_page: 100,
        }
      : undefined
  );
  const { data: assignmentsData } = useAssignments(
    classId
      ? { class_id: classId, status: "published", per_page: 100 }
      : undefined
  );
  const { data: paymentsData } = usePayments(
    studentId ? { student_id: studentId, per_page: 100 } : undefined
  );
  const { data: timetables } = useTimetables(
    classId ? { class_id: classId } : undefined
  );

  const grades = gradesData?.data || [];
  const attendances = attendanceData?.data || [];
  const assignments = assignmentsData?.data || [];
  const payments = paymentsData?.data || [];

  // Calculate stats
  const pendingAssignments = assignments.filter(
    (a) => a.status === "published"
  ).length;
  const attendancePercentage =
    attendances.length > 0
      ? Math.round(
          (attendances.filter(
            (a) => a.status === "present" || a.status === "excused"
          ).length /
            attendances.length) *
            100
        )
      : 0;
  const feesStatus =
    payments.length > 0
      ? payments.every((p) => p.status === "completed")
        ? "Paid"
        : payments.some((p) => p.status === "pending")
        ? "Pending"
        : "Partial"
      : "N/A";

  // Get next class from timetable
  const now = new Date();
  const currentDay = format(now, "EEEE");
  const currentTime = format(now, "HH:mm");
  const todayTimetables = (timetables || []).filter(
    (t) => t.day_of_week?.toLowerCase() === currentDay.toLowerCase()
  );
  const nextClass = todayTimetables
    .filter((t) => t.start_time > currentTime)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
  const nextClassTime = nextClass
    ? format(new Date(`2000-01-01T${nextClass.start_time}`), "h:mm a")
    : "N/A";

  // Calculate average score from grades
  const avgScore =
    grades.length > 0
      ? Math.round(
          grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) /
            grades.length
        )
      : 0;

  // Process performance data (last 6 months of grades)
  const performanceData = grades.slice(-6).map((grade, idx) => ({
    month: format(new Date(grade.exam_date || Date.now()), "MMM"),
    score: Math.round((grade.score / grade.max_score) * 100),
  }));

  // Recent grades
  const recentGrades = grades
    .sort(
      (a, b) =>
        new Date(b.exam_date || 0).getTime() -
        new Date(a.exam_date || 0).getTime()
    )
    .slice(0, 3)
    .map((g) => ({
      id: g.id,
      title: g.subject?.name || "Subject",
      grade: g.grade || `${Math.round((g.score / g.max_score) * 100)}%`,
      date: format(new Date(g.exam_date || Date.now()), "yyyy-MM-dd"),
    }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
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

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Card */}
        <motion.div variants={cardVariants}>
          <Card className="bg-gradient-to-br from-primary to-primary/80">
            <CardContent className="pt-6">
              <div className="text-primary-foreground">
                <h2 className="text-3xl font-bold mb-2">
                  {t("dashboard.welcome")}, {user?.name || t("common.student")}!
                </h2>
                <p className="text-primary-foreground/90">
                  {t("dashboard.progressMessage") ||
                    "You're making great progress this semester"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overview Cards Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: t("dashboard.pendingAssignments"),
              value: pendingAssignments.toString(),
              icon: "📝",
            },
            {
              label: t("dashboard.attendance"),
              value: `${attendancePercentage}%`,
              icon: "✓",
            },
            { label: t("dashboard.feesStatus"), value: feesStatus, icon: "✅" },
            {
              label: t("dashboard.nextClass"),
              value: nextClassTime,
              icon: "⏰",
            },
          ].map((item, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.label}
                      </p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Performance Trend */}
          {performanceData.length > 0 && (
            <motion.div variants={cardVariants} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.performanceTrend")}</CardTitle>
                  <CardDescription>
                    {t("dashboard.scoreProgression") ||
                      "Your score progression over recent exams"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="var(--color-muted-foreground)"
                      />
                      <YAxis
                        stroke="var(--color-muted-foreground)"
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: `1px solid var(--color-border)`,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-primary)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-primary)", r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Average Score
                  </p>
                  <p className="text-2xl font-bold">{avgScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Grades
                  </p>
                  <p className="text-2xl font-bold">{grades.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Attendance
                  </p>
                  <p className="text-2xl font-bold">{attendancePercentage}%</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Activities */}
        {recentGrades.length > 0 && (
          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
                <CardDescription>Your latest grade updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentGrades.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {activity.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
