"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useResults } from "@/hooks/use-results";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import DashboardLayout from "../../dashboard-layout";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function Results() {
  const router = useRouter();
  const { user } = useAuth();
  const studentId = user?.student?.id;
  const [searchTerm, setSearchTerm] = useState("");
  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [term, setTerm] = useState("First Term");

  const { data: resultsData, isLoading } = useResults({
    student_id: studentId,
    academic_year: academicYear,
    term: term,
    per_page: 1000,
  });

  const results = resultsData?.data || [];

  const filteredResults = results.filter((result) => {
    const studentName = result.student?.user?.name?.toLowerCase() || "";
    return studentName.includes(searchTerm.toLowerCase());
  });

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
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={cardVariants}>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Results</h1>
            <p className="text-slate-600 mt-2">
              View your academic performance and grades
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <div>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Search</Label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      placeholder="Search..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Results</CardTitle>
                <Button variant="outline" className="gap-2">
                  <Download size={16} />
                  Download Report Card
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">Loading results...</p>
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Total Subjects</TableHead>
                        <TableHead>Total Score</TableHead>
                        <TableHead className="w-10">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.length > 0 ? (
                        filteredResults.map((result) => {
                          const resultStats = calculateResultStats(result);
                          return (
                            <TableRow
                              key={result.id}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {result.academic_year}
                              </TableCell>
                              <TableCell>{result.term}</TableCell>
                              <TableCell>
                                {result.class?.name || "N/A"}
                              </TableCell>
                              <TableCell>
                                {resultStats?.totalSubjects}
                              </TableCell>
                              <TableCell>{resultStats?.totalScore}</TableCell>
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
                            colSpan={6}
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
      </motion.div>
    </DashboardLayout>
  );
}
