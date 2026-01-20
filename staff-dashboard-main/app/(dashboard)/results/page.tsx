"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, Search } from "lucide-react";
import { useResults, useCreateResult } from "@/hooks/use-results";
import { useAuth } from "@/context/auth-context";
import {
  useTeacherAssignedClasses,
  useTeacherAssignments,
} from "@/hooks/use-teacher-assignments";
import { useSubjects } from "@/hooks/use-subjects";
import { useStudents } from "@/hooks/use-students";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const teacherId = user?.teacher?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(
    undefined
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<
    number | undefined
  >(undefined);
  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [term, setTerm] = useState("First Term");
  const [studentScores, setStudentScores] = useState<
    Record<
      number,
      {
        assignment?: number;
        first_test?: number;
        second_test?: number;
        exam?: number;
      }
    >
  >({});

  const { data: teacherAssignments } = useTeacherAssignments(teacherId);
  const { data: availableClasses = [] } = useTeacherAssignedClasses(teacherId);
  const { data: subjectsData } = useSubjects({
    status: "active",
    per_page: 1000,
  });
  const { data: studentsData } = useStudents({
    class_id: selectedClassId,
    status: "active",
  });

  const subjects = subjectsData?.data || [];
  const students = studentsData?.data || [];

  // Get available subjects from teacher assignments
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

  const { data: resultsData, isLoading } = useResults({
    class_id: selectedClassId,
    academic_year: academicYear,
    term: term,
    per_page: 1000,
  });
  const results = resultsData?.data || [];

  const filteredResults = results.filter((result) => {
    const studentName = result.student?.user?.name?.toLowerCase() || "";
    return studentName.includes(searchTerm.toLowerCase());
  });

  const createResult = useCreateResult();

  const handleScoreChange = (
    studentId: number,
    field: "assignment" | "first_test" | "second_test" | "exam",
    value: string
  ) => {
    setStudentScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value ? parseFloat(value) : undefined,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSubjectId) {
      toast.error("Please select a class and subject");
      return;
    }

    if (students.length === 0) {
      toast.error("No students found for this class");
      return;
    }

    // Group scores by student and create results
    const studentsWithScores = students.filter(
      (s) => studentScores[s.id] && Object.keys(studentScores[s.id]).length > 0
    );

    if (studentsWithScores.length === 0) {
      toast.error("Please enter scores for at least one student");
      return;
    }

    try {
      // For each student, find or create their result and add/update the subject score
      for (const student of studentsWithScores) {
        const scores = studentScores[student.id];
        let existingResult = results.find((r) => r.student_id === student.id);

        if (existingResult) {
          // Update existing result - add or update subject score
          const existingSubjectScore = existingResult.subject_scores?.find(
            (ss) => ss.subject_id === selectedSubjectId
          );

          if (existingSubjectScore) {
            // Update existing subject score
            toast.info(
              `Result already exists for ${student.user?.name}. Please update it from the results list.`
            );
            continue;
          } else {
            // Add new subject score to existing result
            toast.info(
              `Result exists for ${student.user?.name} but this subject is not added yet. Please use the update functionality.`
            );
            continue;
          }
        } else {
          // Create new result with this subject score
          await createResult.mutateAsync({
            student_id: student.id,
            class_id: selectedClassId,
            academic_year: academicYear,
            term: term,
            subject_scores: [
              {
                subject_id: selectedSubjectId,
                assignment: scores.assignment,
                first_test: scores.first_test,
                second_test: scores.second_test,
                exam: scores.exam,
              },
            ],
          });
        }
      }

      toast.success("Results created successfully");
      setIsDialogOpen(false);
      setStudentScores({});
      setSelectedClassId(undefined);
      setSelectedSubjectId(undefined);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create results");
    }
  };

  const calculateResultStats = (result: (typeof results)[0]) => {
    if (!result) return { totalSubjects: 0, totalScore: 0 };
    const totalSubjects = result.subject_scores?.length || 0;
    const totalScore =
      result.subject_scores?.reduce(
        (sum, score) => sum + (score.total || 0),
        0
      ) || 0;
    return { totalSubjects, totalScore };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Results</h1>
          <p className="text-muted-foreground mt-1">
            Manage student results for your assigned subjects
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              Add Results
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Student Results</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Academic Year *</Label>
                  <Select
                    value={academicYear}
                    onValueChange={setAcademicYear}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                      <SelectItem value="2025/2026">2025/2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Term *</Label>
                  <Select value={term} onValueChange={setTerm} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Term">First Term</SelectItem>
                      <SelectItem value="Second Term">Second Term</SelectItem>
                      <SelectItem value="Third Term">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select
                    value={selectedClassId?.toString() || ""}
                    onValueChange={(value) => {
                      setSelectedClassId(value ? parseInt(value) : undefined);
                      setSelectedSubjectId(undefined);
                      setStudentScores({});
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
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
                  <Label>Subject *</Label>
                  <Select
                    value={selectedSubjectId?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedSubjectId(value ? parseInt(value) : undefined)
                    }
                    required
                    disabled={!selectedClassId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map((subject) => (
                        <SelectItem
                          key={subject.id}
                          value={subject.id.toString()}
                        >
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedClassId && selectedSubjectId && students.length > 0 && (
                <div className="space-y-4">
                  <Label>Enter Scores for Students</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Assignment</TableHead>
                            <TableHead>First Test</TableHead>
                            <TableHead>Second Test</TableHead>
                            <TableHead>Exam</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                {student.user?.name ||
                                  `Student ${student.student_id}`}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={
                                    studentScores[student.id]?.assignment || ""
                                  }
                                  onChange={(e) =>
                                    handleScoreChange(
                                      student.id,
                                      "assignment",
                                      e.target.value
                                    )
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={
                                    studentScores[student.id]?.first_test || ""
                                  }
                                  onChange={(e) =>
                                    handleScoreChange(
                                      student.id,
                                      "first_test",
                                      e.target.value
                                    )
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={
                                    studentScores[student.id]?.second_test || ""
                                  }
                                  onChange={(e) =>
                                    handleScoreChange(
                                      student.id,
                                      "second_test",
                                      e.target.value
                                    )
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={studentScores[student.id]?.exam || ""}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      student.id,
                                      "exam",
                                      e.target.value
                                    )
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createResult.isPending ||
                    !selectedClassId ||
                    !selectedSubjectId
                  }
                >
                  {createResult.isPending ? "Creating..." : "Create Results"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={selectedClassId?.toString() || "all"}
                onValueChange={(value) =>
                  setSelectedClassId(
                    value === "all" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  placeholder="Search by student name..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Total Subjects</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead className="w-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result) => {
                      const stats = calculateResultStats(result);
                      return (
                        <TableRow
                          key={result.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {result.student?.user?.name || "N/A"}
                          </TableCell>
                          <TableCell>{result.class?.name || "N/A"}</TableCell>
                          <TableCell>{result.academic_year}</TableCell>
                          <TableCell>{result.term}</TableCell>
                          <TableCell>{stats.totalSubjects}</TableCell>
                          <TableCell>{stats.totalScore}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/results/view/${result.id}`)
                              }
                              className="gap-2"
                            >
                              <Eye size={16} />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No results found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
