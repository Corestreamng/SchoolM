"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/context/auth-context";
import {
  useTeacherAssignedClasses,
  useTeacherAssignments,
} from "@/hooks/use-teacher-assignments";
import { useSubjects } from "@/hooks/use-subjects";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateGrade } from "@/hooks/use-grades";

export default function GradesPage() {
  const { user } = useAuth();
  const teacherId = user?.teacher?.id;
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(
    undefined
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<
    number | undefined
  >(undefined);

  const { data: availableClasses = [] } = useTeacherAssignedClasses(teacherId);
  const { data: teacherAssignments } = useTeacherAssignments(teacherId);
  const { data: subjectsData } = useSubjects({
    status: "active",
    per_page: 1000,
  });
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    class_id: selectedClassId,
    status: "active",
  });

  const subjects = subjectsData?.data || [];
  const availableSubjects = subjects.filter((s) =>
    teacherAssignments?.some((a) => a.subject_id === s.id)
  );

  // Filter subjects based on selected class
  const filteredSubjects = selectedClassId
    ? availableSubjects.filter((s) =>
        teacherAssignments?.some(
          (a) => a.class_id === selectedClassId && a.subject_id === s.id
        )
      )
    : availableSubjects;

  const students = studentsData?.data || [];
  const [grades, setGrades] = useState<
    Record<number, { score: string; max_score: string }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGradeChange = (
    studentId: number,
    field: "score" | "max_score",
    value: string
  ) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const createGrade = useCreateGrade();

  const handleSubmit = async () => {
    if (!selectedClassId || !selectedSubjectId) {
      toast.error("Please select a class and subject");
      return;
    }

    const gradesToSubmit = Object.entries(grades)
      .filter(([_, grade]) => grade.score && grade.max_score)
      .map(([studentId, grade]) => ({
        student_id: parseInt(studentId),
        subject_id: selectedSubjectId,
        class_id: selectedClassId,
        score: parseFloat(grade.score),
        max_score: parseFloat(grade.max_score) || 100,
        exam_type: "General",
      }));

    if (gradesToSubmit.length === 0) {
      toast.error("Please enter at least one grade");
      return;
    }

    setIsSubmitting(true);
    // Submit grades sequentially
    try {
      for (const gradeData of gradesToSubmit) {
        await new Promise<void>((resolve, reject) => {
          createGrade.mutate(gradeData, {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          });
        });
      }
      toast.success("All grades submitted successfully");
      setGrades({});
    } catch (error) {
      toast.error("Failed to submit some grades");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Grade Submission
          </h1>
          <p className="text-muted-foreground mt-1">
            Submit grades for your assigned classes
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={
            students.length === 0 ||
            isSubmitting ||
            !selectedClassId ||
            !selectedSubjectId
          }
        >
          {isSubmitting ? "Submitting..." : "Submit Grades"}
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Class</Label>
            <Select
              value={selectedClassId?.toString() || ""}
              onValueChange={(value) => {
                setSelectedClassId(value ? parseInt(value) : undefined);
                setSelectedSubjectId(undefined);
              }}
            >
              <SelectTrigger>
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
          <div className="space-y-2">
            <Label>Select Subject</Label>
            <Select
              value={selectedSubjectId?.toString() || ""}
              onValueChange={(value) =>
                setSelectedSubjectId(value ? parseInt(value) : undefined)
              }
              disabled={!selectedClassId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {studentsLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading students...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {selectedClassId
            ? "No students found in this class"
            : "Please select a class"}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Score
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Max Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {student.user?.name || `Student ${student.student_id}`}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Input
                        type="number"
                        min="0"
                        value={grades[student.id]?.score || ""}
                        onChange={(e) =>
                          handleGradeChange(student.id, "score", e.target.value)
                        }
                        className="w-20 text-center"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Input
                        type="number"
                        min="0"
                        value={grades[student.id]?.max_score || ""}
                        onChange={(e) =>
                          handleGradeChange(
                            student.id,
                            "max_score",
                            e.target.value
                          )
                        }
                        className="w-20 text-center"
                        placeholder="100"
                      />
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
