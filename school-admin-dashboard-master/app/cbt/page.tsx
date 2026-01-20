"use client";

import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { More, Trash, Eye, SearchNormal, Edit, Add } from "iconsax-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

interface Exam {
  id: string;
  title: string;
  subject: string;
  class: string;
  totalQuestions: number;
  duration: number;
  status: "draft" | "active" | "completed";
}

interface ExamResult {
  id: string;
  studentName: string;
  exam: string;
  score: number;
  totalMarks: number;
  percentage: number;
  date: string;
}

const mockExams: Exam[] = [
  {
    id: "1",
    title: "Mathematics Mid-Term",
    subject: "Mathematics",
    class: "JSS 1A",
    totalQuestions: 50,
    duration: 120,
    status: "completed",
  },
  {
    id: "2",
    title: "English First Continuous Assessment",
    subject: "English",
    class: "JSS 2B",
    totalQuestions: 40,
    duration: 90,
    status: "active",
  },
  {
    id: "3",
    title: "Sciences Final Exam",
    subject: "Sciences",
    class: "SSS 1C",
    totalQuestions: 60,
    duration: 150,
    status: "draft",
  },
];

const mockResults: ExamResult[] = [
  {
    id: "1",
    studentName: "John Adekunle",
    exam: "Mathematics Mid-Term",
    score: 78,
    totalMarks: 100,
    percentage: 78,
    date: "2025-01-15",
  },
  {
    id: "2",
    studentName: "Sarah Okafor",
    exam: "Mathematics Mid-Term",
    score: 85,
    totalMarks: 100,
    percentage: 85,
    date: "2025-01-15",
  },
  {
    id: "3",
    studentName: "Chioma Nwankwo",
    exam: "English First Continuous Assessment",
    score: 92,
    totalMarks: 100,
    percentage: 92,
    date: "2025-01-20",
  },
];

const gradeDistribution = [
  { grade: "A (80-100)", count: 25, fill: "var(--color-primary)" },
  { grade: "B (70-79)", count: 35, fill: "var(--color-chart-2)" },
  { grade: "C (60-69)", count: 22, fill: "var(--color-chart-3)" },
  { grade: "D (50-59)", count: 12, fill: "var(--color-chart-4)" },
  { grade: "F (<50)", count: 6, fill: "var(--color-destructive)" },
];

export default function CBTPage() {
  const [exams, setExams] = useState<Exam[]>(mockExams);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    draft: "bg-gray-500/20 text-gray-700",
    active: "bg-green-500/20 text-green-700",
    completed: "bg-blue-500/20 text-blue-700",
  };

  const averageScore = (
    mockResults.reduce((sum, r) => sum + r.percentage, 0) / mockResults.length
  ).toFixed(1);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopNav />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  CBT (Computer-Based Testing)
                </h1>
                <p className="text-muted-foreground mt-2">
                  Create and manage exams and monitor results
                </p>
              </div>
              <Button className="gap-2">
                <Add size={18} />
                New Exam
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Exams</p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {exams.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Exams
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {exams.filter((e) => e.status === "active").length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Results
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {mockResults.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Average Score
                    </p>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {averageScore}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="exams" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="exams">Exams</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="exams" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Exam Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Duration (min)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-10">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExams.map((exam) => (
                            <TableRow
                              key={exam.id}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {exam.title}
                              </TableCell>
                              <TableCell>{exam.subject}</TableCell>
                              <TableCell>{exam.class}</TableCell>
                              <TableCell>{exam.totalQuestions}</TableCell>
                              <TableCell>{exam.duration}</TableCell>
                              <TableCell>
                                <Badge className={statusColors[exam.status]}>
                                  {exam.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <More size={16} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="gap-2 cursor-pointer">
                                      <Eye size={16} />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                                      <Trash size={16} />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Exam Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Exam</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockResults.map((result) => (
                            <TableRow
                              key={result.id}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {result.studentName}
                              </TableCell>
                              <TableCell className="text-sm">
                                {result.exam}
                              </TableCell>
                              <TableCell>{`${result.score}/${result.totalMarks}`}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    result.percentage >= 70
                                      ? "bg-green-500/20 text-green-700"
                                      : "bg-yellow-500/20 text-yellow-700"
                                  }
                                >
                                  {result.percentage}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(result.date).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={gradeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ grade, count }) => `${grade}: ${count}`}
                          outerRadius={100}
                          dataKey="count"
                        >
                          {gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
