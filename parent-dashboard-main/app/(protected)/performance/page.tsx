"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StudentSelector } from "@/components/student-selector";
import { Award, Star, TrendUp } from "iconsax-react";
import { useState, useEffect } from "react";
import { useResultsByStudent } from "@/hooks/use-results";
import { useGrades } from "@/hooks/use-grades";
import { useStudents } from "@/hooks/use-students";

export default function Performance() {
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

  // Calculate performance metrics
  const excellentGrades = grades.filter(
    (g) => g.grade === "A" || (g.score / g.max_score) * 100 >= 90
  ).length;
  const goodGrades = grades.filter(
    (g) =>
      g.grade === "B" ||
      ((g.score / g.max_score) * 100 >= 70 &&
        (g.score / g.max_score) * 100 < 90)
  ).length;

  // Get top subjects by score
  const topSubjects = [...grades]
    .sort((a, b) => b.score / b.max_score - a.score / a.max_score)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Awards & Performance
        </h1>
        <p className="text-slate-600 mt-2">
          Track achievements and recognition
        </p>
      </div>

      <div className="flex justify-end">
        <StudentSelector
          selectedStudentId={selectedStudentId}
          onSelect={setSelectedStudentId}
        />
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Excellent Grades</p>
                <p className="text-3xl font-bold text-green-600">
                  {excellentGrades}
                </p>
                <p className="text-xs text-slate-400 mt-2">A grade or 90%+</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Star size={24} color="oklch(62.7% 0.194 149.214)" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Good Grades</p>
                <p className="text-3xl font-bold text-blue-600">{goodGrades}</p>
                <p className="text-xs text-slate-400 mt-2">B grade or 70%+</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendUp size={24} color="#155dfc" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Results</p>
                <p className="text-3xl font-bold text-purple-600">
                  {results?.length || 0}
                </p>
                <p className="text-xs text-slate-400 mt-2">Result records</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award size={24} color="#9810fa" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Subjects */}
      {topSubjects.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">
              Top Performing Subjects
            </h3>
            <div className="space-y-4">
              {topSubjects.map((grade, idx) => {
                const percentage = (grade.score / grade.max_score) * 100;
                return (
                  <div key={grade.id} className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Star size={24} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">
                        {grade.subject?.name || "Subject"}
                      </h4>
                      <p className="text-slate-600 text-sm mt-1">
                        Score: {grade.score}/{grade.max_score} (
                        {Math.round(percentage)}%)
                      </p>
                      {grade.grade && (
                        <span className="inline-block text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full mt-2">
                          Grade: {grade.grade}
                        </span>
                      )}
                      {grade.remarks && (
                        <p className="text-xs text-slate-500 mt-2">
                          {grade.remarks}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        #{idx + 1}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Award size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No performance data available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
