"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Add, Eye, SearchNormal, More, Trash, ArrowDown2 } from "iconsax-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResults, useDeleteResult } from "@/hooks/use-results";
import { useClasses } from "@/hooks/use-classes";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";
import { resultsApi } from "@/lib/api/results";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ResultsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [academicYear, setAcademicYear] = useState("2024/2025");
  const [term, setTerm] = useState("First Term");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: resultsData, isLoading } = useResults({
    class_id:
      selectedClass && selectedClass !== "all"
        ? parseInt(selectedClass)
        : undefined,
    academic_year: academicYear,
    term: term,
  });
  const { data: classesData } = useClasses();
  const deleteResult = useDeleteResult();

  const results = resultsData?.data || [];
  const classes = classesData?.data || [];

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

  const handleDeleteClick = (id: number) => {
    setResultToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resultToDelete) return;

    try {
      await deleteResult.mutateAsync(resultToDelete);
      toast({
        title: "Success",
        description: "Result deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setResultToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete result. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to delete result:", error);
    }
  };

  const handleDownloadCsv = async () => {
    setIsDownloading(true);
    try {
      const params: {
        academic_year: string;
        term: string;
        class_id?: number;
      } = {
        academic_year: academicYear,
        term: term,
      };

      if (selectedClass && selectedClass !== "all") {
        params.class_id = parseInt(selectedClass);
      }

      const blob = await resultsApi.downloadCsv(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const className = selectedClass && selectedClass !== "all"
        ? classes.find((c) => c.id.toString() === selectedClass)?.name?.replace(/\s+/g, '_').toLowerCase() || 'all'
        : 'all';
      a.download = `results_${academicYear.replace('/', '_')}_${term.replace(/\s+/g, '_').toLowerCase()}_${className}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Results CSV downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to download results CSV.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Results Management
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Manage student results and academic records
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleDownloadCsv}
                    variant="outline"
                    className="gap-2"
                    disabled={isDownloading || results.length === 0}
                  >
                    <ArrowDown2 size={18} />
                    {isDownloading ? "Downloading..." : "Download CSV"}
                  </Button>
                  <Button
                    onClick={() => router.push("/results/add")}
                    className="gap-2"
                  >
                    <Add size={18} color="white" />
                    Add Result
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Select
                        value={academicYear}
                        onValueChange={setAcademicYear}
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
                      <Label>Term</Label>
                      <Select value={term} onValueChange={setTerm}>
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
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select
                        value={selectedClass}
                        onValueChange={setSelectedClass}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {classes.map((cls) => (
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
                        <SearchNormal
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
                              const resultStats = calculateResultStats(result);
                              return (
                                <TableRow
                                  key={result.id}
                                  className="hover:bg-muted/50 transition-colors"
                                >
                                  <TableCell className="font-medium">
                                    {result.student?.user?.name || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {result.class?.name || "N/A"}
                                  </TableCell>
                                  <TableCell>{result.academic_year}</TableCell>
                                  <TableCell>{result.term}</TableCell>
                                  <TableCell>
                                    {resultStats?.totalSubjects}
                                  </TableCell>
                                  <TableCell>
                                    {resultStats?.totalScore}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          router.push(
                                            `/results/view/${result.id}`
                                          )
                                        }
                                        className="gap-2"
                                      >
                                        <Eye size={16} />
                                        View
                                      </Button>
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
                                          <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-destructive"
                                            onClick={() =>
                                              handleDeleteClick(result.id)
                                            }
                                          >
                                            <Trash size={16} />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
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
          </main>
        </div>
      </div>
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Are you sure?"
        description="This will permanently delete this result. This action cannot be undone."
      />
    </AuthGuard>
  );
}
