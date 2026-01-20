"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useAssignments } from "@/hooks/use-assignments";
import { useAuth } from "@/context/auth-context";
import { format } from "date-fns";

export function RecentActivity() {
  const { user } = useAuth();
  const teacherId = user?.teacher?.id;

  const { data: assignmentsData } = useAssignments(
    teacherId ? { teacher_id: teacherId, per_page: 20 } : undefined
  );

  const assignments = assignmentsData?.data || [];

  const activities = assignments
    .sort(
      (a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    )
    .slice(0, 4)
    .map((assignment) => {
      const submissions = assignment.submissions || [];
      const hasUngradedSubmissions = submissions.some(
        (s) => !s.score && s.status !== "draft"
      );
      const isGraded =
        submissions.length > 0 && submissions.every((s) => s.score);

      return {
        type: isGraded
          ? "graded"
          : hasUngradedSubmissions
          ? "pending"
          : "pending",
        title: assignment.title,
        class: assignment.class?.name || "N/A",
        time: format(new Date(assignment.due_date), "MMM d"),
        icon: isGraded
          ? CheckCircle
          : hasUngradedSubmissions
          ? AlertCircle
          : Clock,
        color: isGraded
          ? "text-green-600"
          : hasUngradedSubmissions
          ? "text-orange-600"
          : "text-blue-600",
      };
    });

  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Recent Activity
      </h3>
      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recent activity
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
              >
                <Icon
                  className={`${activity.color} w-5 h-5 mt-1 flex-shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.class}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
