"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "@/app/dashboard-layout";
import { useGrades } from "@/hooks/use-grades";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function GradesPage() {
  const { user } = useAuth();
  const studentId = user?.student?.id;

  const { data: gradesData, isLoading } = useGrades(
    studentId ? { student_id: studentId, per_page: 1000 } : undefined
  );

  const grades = gradesData?.data || [];

  // Process subject performance
  const subjectPerformance = useMemo(() => {
    const subjectMap = new Map<string, { total: number; count: number }>();

    grades.forEach((grade) => {
      const subjectName = grade.subject?.name || "Unknown";
      const percentage = (grade.score / grade.max_score) * 100;

      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, { total: 0, count: 0 });
      }

      const existing = subjectMap.get(subjectName)!;
      existing.total += percentage;
      existing.count += 1;
    });

    return Array.from(subjectMap.entries())
      .map(([subject, data]) => ({
        name: subject.length > 8 ? subject.substring(0, 8) : subject,
        fullName: subject,
        score: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.score - a.score);
  }, [grades]);

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={cardVariants}>
          <div>
            <h1 className="text-3xl font-bold mb-2">Grades & Results</h1>
            <p className="text-muted-foreground">
              Your academic performance overview
            </p>
          </div>
        </motion.div>

        {/* Charts Grid */}
        {subjectPerformance.length > 0 && (
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Score breakdown by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectPerformance}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="var(--color-muted-foreground)"
                      />
                      <YAxis
                        stroke="var(--color-muted-foreground)"
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                        }}
                      />
                      <Bar dataKey="score" fill="var(--color-primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Number of grades by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Grades
                      </p>
                      <p className="text-3xl font-bold">{grades.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Average Score
                      </p>
                      <p className="text-3xl font-bold">
                        {grades.length > 0
                          ? Math.round(
                              grades.reduce(
                                (sum, g) => sum + (g.score / g.max_score) * 100,
                                0
                              ) / grades.length
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Grades Table */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Subject Grades</CardTitle>
              <CardDescription>
                Detailed breakdown of all your grades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading grades...
                </div>
              ) : grades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No grades available
                </div>
              ) : (
                <div className="space-y-2">
                  {grades.map((grade) => {
                    const percentage = (grade.score / grade.max_score) * 100;
                    return (
                      <motion.div
                        key={grade.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              {grade.subject?.name || "Subject"}
                            </p>
                            {grade.grade && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {grade.grade}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {grade.exam_type} -{" "}
                            {format(
                              new Date(grade.exam_date || Date.now()),
                              "MMM d, yyyy"
                            )}
                          </p>
                          {grade.remarks && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {grade.remarks}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {Math.round(percentage)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {grade.score}/{grade.max_score}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
