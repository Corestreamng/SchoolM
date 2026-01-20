"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useGrades } from "@/hooks/use-grades";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/context/auth-context";
import { useTeacherAssignedClasses } from "@/hooks/use-teacher-assignments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PerformancePage() {
  const { user } = useAuth();
  const teacherId = user?.teacher?.id;
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(
    undefined
  );

  const { data: availableClasses = [] } = useTeacherAssignedClasses(teacherId);

  const { data: studentsData } = useStudents({
    class_id: selectedClassId,
    status: "active",
  });
  const students = studentsData?.data || [];

  const { data: gradesData } = useGrades({
    class_id: selectedClassId,
    per_page: 1000,
  });
  const grades = gradesData?.data || [];

  // Group grades by student and subject
  const performanceData = useMemo(() => {
    if (!selectedClassId || students.length === 0) return [];

    const studentPerformance: Record<
      number,
      { name: string; subjects: Record<number, number[]>; avg: number }
    > = {};

    students.forEach((student) => {
      studentPerformance[student.id] = {
        name: student.user?.name || `Student ${student.student_id}`,
        subjects: {},
        avg: 0,
      };
    });

    grades.forEach((grade) => {
      if (!studentPerformance[grade.student_id]) return;
      if (!studentPerformance[grade.student_id].subjects[grade.subject_id]) {
        studentPerformance[grade.student_id].subjects[grade.subject_id] = [];
      }
      const percentage =
        grade.max_score > 0 ? (grade.score / grade.max_score) * 100 : 0;
      studentPerformance[grade.student_id].subjects[grade.subject_id].push(
        percentage
      );
    });

    // Get unique subjects
    const subjectIds = [
      ...new Set(grades.map((g) => g.subject_id)),
    ] as number[];
    const subjectNames: Record<number, string> = {};
    grades.forEach((g) => {
      if (g.subject && !subjectNames[g.subject_id]) {
        subjectNames[g.subject_id] = g.subject.name;
      }
    });

    return Object.entries(studentPerformance).map(([studentId, data]) => {
      const subjectScores: Record<string, number> = {};
      let totalScore = 0;
      let subjectCount = 0;

      subjectIds.forEach((subjectId) => {
        const scores = data.subjects[subjectId] || [];
        const avgScore =
          scores.length > 0
            ? scores.reduce((sum, s) => sum + s, 0) / scores.length
            : 0;
        subjectScores[subjectNames[subjectId] || `Subject ${subjectId}`] =
          Math.round(avgScore);
        if (avgScore > 0) {
          totalScore += avgScore;
          subjectCount++;
        }
      });

      return {
        student: data.name,
        ...subjectScores,
        avg: subjectCount > 0 ? totalScore / subjectCount : 0,
      };
    });
  }, [students, grades, selectedClassId]);

  const subjectNames = useMemo(() => {
    const names = new Set<string>();
    performanceData.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (key !== "student" && key !== "avg") {
          names.add(key);
        }
      });
    });
    return Array.from(names);
  }, [performanceData]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Student Performance
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor student progress and grades
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg p-6 border border-border"
      >
        <div className="mb-6">
          <Label className="mb-2 block">Select Class</Label>
          <Select
            value={selectedClassId?.toString() || ""}
            onValueChange={(value) =>
              setSelectedClassId(value ? parseInt(value) : undefined)
            }
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClassId && performanceData.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-6">
              {availableClasses.find((c) => c.id === selectedClassId)?.name ||
                "Class"}{" "}
              - Performance Overview
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="student" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--border)`,
                    borderRadius: "0.625rem",
                  }}
                />
                <Legend />
                {subjectNames.map((subjectName, idx) => (
                  <Bar
                    key={subjectName}
                    dataKey={subjectName}
                    fill={`var(--chart-${(idx % 5) + 1})`}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : selectedClassId ? (
          <div className="text-center py-12 text-muted-foreground">
            No performance data available for this class
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Please select a class to view performance data
          </div>
        )}
      </motion.div>

      {selectedClassId && performanceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Student Name
                  </th>
                  {subjectNames.map((subjectName) => (
                    <th
                      key={subjectName}
                      className="px-6 py-4 text-left text-sm font-semibold text-foreground"
                    >
                      {subjectName}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    whileHover={{ backgroundColor: "var(--secondary)" }}
                    className="border-b border-border last:border-0 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {row.student}
                    </td>
                    {subjectNames.map((subjectName) => (
                      <td
                        key={subjectName}
                        className="px-6 py-4 text-sm text-foreground"
                      >
                        {(row as any)[subjectName] || "-"}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm font-semibold text-accent">
                      {row.avg.toFixed(1)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
