"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateResult } from "@/hooks/use-results";
import { useStudents } from "@/hooks/use-students";
import { useClasses } from "@/hooks/use-classes";
import { useSubjects } from "@/hooks/use-subjects";
import { useToast } from "@/hooks/use-toast";
import { Add, Trash, ArrowLeft } from "iconsax-react";

interface SubjectScoreInput {
  subject_id: number;
  assignment: string;
  first_test: string;
  second_test: string;
  exam: string;
}

export default function AddResultsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createResult = useCreateResult();
  const { data: studentsData } = useStudents();
  const { data: classesData } = useClasses();
  const { data: subjectsData } = useSubjects();

  const students = studentsData?.data || [];
  const classes = classesData?.data || [];
  const subjects = subjectsData?.data || [];

  const [formData, setFormData] = useState({
    student_id: "",
    class_id: "",
    academic_year: "2024/2025",
    term: "First Term",
    subject_scores: [] as SubjectScoreInput[],
    form_master_remark: "",
    principal_remark: "",
    verbal_skills: "",
    self_control: "",
    obedience: "",
    punctuality: "",
    honesty: "",
    assignment: "",
    neatness: "",
    attitude_to_learn: "",
  });

  const handleAddSubject = () => {
    setFormData({
      ...formData,
      subject_scores: [
        ...formData.subject_scores,
        {
          subject_id: 0,
          assignment: "",
          first_test: "",
          second_test: "",
          exam: "",
        },
      ],
    });
  };

  const handleRemoveSubject = (index: number) => {
    setFormData({
      ...formData,
      subject_scores: formData.subject_scores.filter((_, i) => i !== index),
    });
  };

  const handleSubjectChange = (
    index: number,
    field: keyof SubjectScoreInput,
    value: string | number
  ) => {
    const newScores = [...formData.subject_scores];
    newScores[index] = { ...newScores[index], [field]: value };
    setFormData({ ...formData, subject_scores: newScores });
  };

  const handleSubmit = async () => {
    if (!formData.student_id || !formData.class_id) {
      toast({
        title: "Error",
        description: "Please select a student and class.",
        variant: "destructive",
      });
      return;
    }

    if (formData.subject_scores.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one subject score.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createResult.mutateAsync({
        student_id: parseInt(formData.student_id),
        class_id: parseInt(formData.class_id),
        academic_year: formData.academic_year,
        term: formData.term,
        subject_scores: formData.subject_scores.map((score) => ({
          subject_id: score.subject_id,
          assignment: score.assignment
            ? parseFloat(score.assignment)
            : undefined,
          first_test: score.first_test
            ? parseFloat(score.first_test)
            : undefined,
          second_test: score.second_test
            ? parseFloat(score.second_test)
            : undefined,
          exam: score.exam ? parseFloat(score.exam) : undefined,
        })),
        form_master_remark: formData.form_master_remark || undefined,
        principal_remark: formData.principal_remark || undefined,
        verbal_skills: formData.verbal_skills || undefined,
        self_control: formData.self_control || undefined,
        obedience: formData.obedience || undefined,
        punctuality: formData.punctuality || undefined,
        honesty: formData.honesty || undefined,
        assignment: formData.assignment || undefined,
        neatness: formData.neatness || undefined,
        attitude_to_learn: formData.attitude_to_learn || undefined,
      });

      toast({
        title: "Success",
        description: "Result record created successfully.",
      });
      router.push("/results");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to create result. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create result:", error);
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
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/results")}
                  className="gap-2"
                >
                  <ArrowLeft size={18} />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Add Result Record
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Create a new result record for a student
                  </p>
                </div>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Student <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.student_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, student_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem
                              key={student.id}
                              value={student.id.toString()}
                            >
                              {student.user?.name || student.student_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Class <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, class_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
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
                      <Label>Academic Year</Label>
                      <Select
                        value={formData.academic_year}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            academic_year: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024/2025">2024/2025</SelectItem>
                          <SelectItem value="2023/2024">2023/2024</SelectItem>
                          <SelectItem value="2025/2026">2025/2026</SelectItem>
                          <SelectItem value="2026/2027">2026/2027</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Term</Label>
                      <Select
                        value={formData.term}
                        onValueChange={(value) =>
                          setFormData({ ...formData, term: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="First Term">First Term</SelectItem>
                          <SelectItem value="Second Term">
                            Second Term
                          </SelectItem>
                          <SelectItem value="Third Term">Third Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Subject Scores</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSubject}
                    >
                      <Add size={16} />
                      Add Subject
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.subject_scores.map((score, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-6 gap-4">
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Select
                            value={
                              score.subject_id > 0
                                ? score.subject_id.toString()
                                : ""
                            }
                            onValueChange={(value) =>
                              handleSubjectChange(
                                index,
                                "subject_id",
                                parseInt(value)
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
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
                        <div className="space-y-2">
                          <Label>Assignment</Label>
                          <Input
                            type="number"
                            value={score.assignment}
                            onChange={(e) =>
                              handleSubjectChange(
                                index,
                                "assignment",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>1st Test</Label>
                          <Input
                            type="number"
                            value={score.first_test}
                            onChange={(e) =>
                              handleSubjectChange(
                                index,
                                "first_test",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>2nd Test</Label>
                          <Input
                            type="number"
                            value={score.second_test}
                            onChange={(e) =>
                              handleSubjectChange(
                                index,
                                "second_test",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Exam</Label>
                          <Input
                            type="number"
                            value={score.exam}
                            onChange={(e) =>
                              handleSubjectChange(index, "exam", e.target.value)
                            }
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveSubject(index)}
                          >
                            <Trash size={16} color="white" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {formData.subject_scores.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No subjects added. Click "Add Subject" to get started.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>General Evaluation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "verbal_skills", label: "Verbal Skills" },
                      { key: "self_control", label: "Self Control" },
                      { key: "obedience", label: "Obedience" },
                      { key: "punctuality", label: "Punctuality" },
                      { key: "honesty", label: "Honesty" },
                      { key: "assignment", label: "Assignment" },
                      { key: "neatness", label: "Neatness" },
                      { key: "attitude_to_learn", label: "Attitude to Learn" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <Label>{label}</Label>
                        <Select
                          value={
                            formData[key as keyof typeof formData] as string
                          }
                          onValueChange={(value) =>
                            setFormData({ ...formData, [key]: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A - Excellent</SelectItem>
                            <SelectItem value="B">B - Very Good</SelectItem>
                            <SelectItem value="C">C - Good</SelectItem>
                            <SelectItem value="D">D - Average</SelectItem>
                            <SelectItem value="E">E - Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Remarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Form Master's Remark</Label>
                    <Textarea
                      value={formData.form_master_remark}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          form_master_remark: e.target.value,
                        })
                      }
                      placeholder="Enter form master's remark..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Principal's Remark</Label>
                    <Textarea
                      value={formData.principal_remark}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          principal_remark: e.target.value,
                        })
                      }
                      placeholder="Enter principal's remark..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/results")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createResult.isPending}
                >
                  {createResult.isPending ? "Creating..." : "Create Result"}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
