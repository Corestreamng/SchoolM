"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSelector } from "@/components/student-selector";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useState, useEffect, useMemo } from "react";
import { useResultsByStudent } from "@/hooks/use-results";
import { useGrades } from "@/hooks/use-grades";
import { useStudents } from "@/hooks/use-students";
import { format } from "date-fns";

export default function Progress() {
  const { data: studentsData } = useStudents();
  const students = studentsData?.data || [];
  const [selectedStudentId, setSelectedStudentId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const { data: results } = useResultsByStudent(selectedStudentId || 0);
  const { data: gradesData } = useGrades(
    selectedStudentId
      ? { student_id: selectedStudentId, per_page: 1000 }
      : undefined
  );

  const grades = gradesData?.data || [];

  // Process results for trend chart
  const progressData = useMemo(() => {
    if (!results || results.length === 0) return [];

    return results
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateA.getTime() - dateB.getTime();
      })
      .map((result, idx) => {
        const avgScore =
          result.total_score && result.total_subjects
            ? Math.round(
                (result.total_score / result.total_subjects / 100) * 100
              )
            : 0;

        return {
          period: `${result.term} ${result.academic_year}`,
          average: avgScore,
        };
      });
  }, [results]);

  // Process subject-wise progress
  const subjectProgress = useMemo(() => {
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
        subject,
        average: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.average - a.average);
  }, [grades]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Progress Tracking</h1>
        <p className="text-slate-600 mt-2">
          Monitor academic improvement trends
        </p>
      </div>

      <div className="flex justify-end">
        <StudentSelector
          selectedStudentId={selectedStudentId}
          onSelect={setSelectedStudentId}
        />
      </div>

      {progressData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Academic Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-500">No progress data available yet</p>
          </CardContent>
        </Card>
      )}

      {subjectProgress.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectProgress.map((item) => (
                <div key={item.subject}>
                  <div className="flex justify-between mb-2">
                    <p className="font-medium text-slate-900">{item.subject}</p>
                    <p className="text-sm font-semibold text-slate-600">
                      {item.average}%
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(item.average, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-500">No subject progress data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
