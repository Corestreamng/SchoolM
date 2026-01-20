"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useClasses } from "@/hooks/use-classes";
import {
  useStudentsByClassForPromotion,
  usePromoteStudents,
} from "@/hooks/use-promotions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PromotionsPage() {
  const [sourceClassId, setSourceClassId] = useState<string>("");
  const [targetClassId, setTargetClassId] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [academicYear, setAcademicYear] = useState("2024/2025");

  const { data: classesData } = useClasses();
  const { data: students, isLoading } = useStudentsByClassForPromotion(
    sourceClassId ? parseInt(sourceClassId) : 0
  );
  const promoteStudents = usePromoteStudents();
  const { toast } = useToast();

  const classes = classesData?.data || [];

  const handleSelectAll = () => {
    if (!students) return;
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handlePromote = async () => {
    if (!targetClassId) {
      toast({
        title: "Error",
        description: "Please select a target class",
        variant: "destructive",
      });
      return;
    }

    if (selectedStudentIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    try {
      await promoteStudents.mutateAsync({
        student_ids: selectedStudentIds,
        new_class_id: parseInt(targetClassId),
        academic_year: academicYear,
      });
      toast({
        title: "Success",
        description: `${selectedStudentIds.length} student(s) promoted successfully`,
      });
      setSelectedStudentIds([]);
      setSourceClassId("");
      setTargetClassId("");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to promote students",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <TopNav />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Student Promotion
                </h1>
                <p className="text-muted-foreground mt-2">
                  Promote students from one class to another
                </p>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Promotion Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Source Class (Current)</Label>
                      <Select
                        value={sourceClassId}
                        onValueChange={(value) => {
                          setSourceClassId(value);
                          setSelectedStudentIds([]);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Class (New)</Label>
                      <Select
                        value={targetClassId}
                        onValueChange={setTargetClassId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes
                            .filter(
                              (cls) => cls.id.toString() !== sourceClassId
                            )
                            .map((cls) => (
                              <SelectItem
                                key={cls.id}
                                value={cls.id.toString()}
                              >
                                {cls.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Select
                        value={academicYear}
                        onValueChange={setAcademicYear}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024/2025">2024/2025</SelectItem>
                          <SelectItem value="2023/2024">2023/2024</SelectItem>
                          <SelectItem value="2025/2026">2025/2026</SelectItem>
                          <SelectItem value="2026/2027">2026/2027</SelectItem>
                          <SelectItem value="2027/2028">2027/2028</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {sourceClassId && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Select Students to Promote</CardTitle>
                      {students && students.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          {selectedStudentIds.length === students.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : students && students.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded"
                          >
                            <Checkbox
                              checked={selectedStudentIds.includes(student.id)}
                              onCheckedChange={() =>
                                handleSelectStudent(student.id)
                              }
                            />
                            <Label className="flex-1 cursor-pointer">
                              {student.user?.name || student.student_id} -{" "}
                              {student.class?.name || "No class"}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No students found in this class
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedStudentIds.length > 0 && targetClassId && (
                <div className="flex justify-end gap-4">
                  <Button
                    onClick={handlePromote}
                    disabled={promoteStudents.isPending}
                    className="gap-2"
                  >
                    {promoteStudents.isPending
                      ? "Promoting..."
                      : `Promote ${selectedStudentIds.length} Student(s)`}
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
