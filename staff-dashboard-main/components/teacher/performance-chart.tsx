"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGrades } from "@/hooks/use-grades";
import { useAuth } from "@/context/auth-context";
import { useMemo } from "react";
import { format } from "date-fns";

export function PerformanceChart() {
  const { user } = useAuth();
  const teacherId = user?.teacher?.id;

  // Get grades for classes taught by this teacher
  // Note: This would ideally filter by teacher's classes, but grades API doesn't support teacher_id
  // For now, we'll use all grades or implement a different approach
  const { data: gradesData } = useGrades({ per_page: 1000 });
  const grades = gradesData?.data || [];

  // Group grades by month and calculate average
  const data = useMemo(() => {
    const monthMap = new Map<string, { total: number; count: number }>();

    grades.forEach((grade) => {
      const month = format(new Date(grade.exam_date || Date.now()), "MMM");
      const percentage = (grade.score / grade.max_score) * 100;

      if (!monthMap.has(month)) {
        monthMap.set(month, { total: 0, count: 0 });
      }

      const existing = monthMap.get(month)!;
      existing.total += percentage;
      existing.count += 1;
    });

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months
      .slice(-6)
      .map((month) => {
        const stats = monthMap.get(month) || { total: 0, count: 0 };
        return {
          month,
          average: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
          target: 75,
        };
      })
      .filter(
        (d) => d.average > 0 || months.indexOf(d.month) >= months.length - 6
      );
  }, [grades]);

  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Student Performance Trend
      </h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "0.625rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--chart-2)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No performance data available
        </div>
      )}
    </div>
  );
}
