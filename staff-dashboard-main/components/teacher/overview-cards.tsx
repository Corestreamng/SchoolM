"use client";

import { motion } from "framer-motion";
import { Users, CheckCircle, Clock, BookMarked } from "lucide-react";
import { useAssignments } from "@/hooks/use-assignments";
import { useAttendance } from "@/hooks/use-attendance";
import { useTimetables } from "@/hooks/use-timetables";
import { useAuth } from "@/context/auth-context";
import { format, startOfWeek, endOfWeek } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

export function OverviewCards() {
  const { user } = useAuth();
  const teacherId = user?.teacher?.id;

  const { data: assignmentsData } = useAssignments(
    teacherId
      ? { teacher_id: teacherId, status: "published", per_page: 1000 }
      : undefined
  );
  const { data: attendanceData } = useAttendance(
    teacherId ? { per_page: 100 } : undefined
  );
  const { data: timetables } = useTimetables(
    teacherId ? { teacher_id: teacherId, per_page: 1000 } : undefined
  );

  const assignments = assignmentsData?.data || [];
  const attendances = attendanceData?.data || [];

  // Calculate pending assignments (those with submissions that need grading)
  const pendingAssignments = assignments.filter((a) => {
    const submissions = a.submissions || [];
    return submissions.some((s) => !s.score && s.status !== "draft");
  }).length;

  // Calculate attendance rate
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const recentAttendance = attendances.filter((a) => {
    const attendanceDate = new Date(a.date);
    return attendanceDate >= weekStart && attendanceDate <= weekEnd;
  });
  const attendanceRate =
    recentAttendance.length > 0
      ? Math.round(
          (recentAttendance.filter((a) => a.status === "present").length /
            recentAttendance.length) *
            100
        )
      : 0;

  // Count upcoming classes this week
  const currentDay = format(new Date(), "EEEE");
  const upcomingClasses = (timetables || []).filter((t) => {
    const dayIndex = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].indexOf(t.day_of_week || "");
    const currentDayIndex = new Date().getDay() - 1;
    return dayIndex >= currentDayIndex;
  }).length;

  // Count assignments due soon (within 3 days)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const gradingTasks = assignments.filter((a) => {
    const dueDate = new Date(a.due_date);
    return dueDate <= threeDaysFromNow && a.status === "published";
  }).length;

  const cards = [
    {
      label: "Pending Assignments",
      value: pendingAssignments.toString(),
      subtext: "to be graded",
      icon: CheckCircle,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Attendance Rate",
      value: `${attendanceRate}%`,
      subtext: "this week",
      icon: Users,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Upcoming Classes",
      value: upcomingClasses.toString(),
      subtext: "this week",
      icon: Clock,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Grading Tasks",
      value: gradingTasks.toString(),
      subtext: "due soon",
      icon: BookMarked,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="bg-card rounded-lg p-6 border border-border shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className={`${card.iconColor} w-6 h-6`} />
              </div>
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-1">
              {card.label}
            </p>
            <h3 className="text-3xl font-bold text-foreground">{card.value}</h3>
            <p className="text-xs text-muted-foreground mt-2">{card.subtext}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
