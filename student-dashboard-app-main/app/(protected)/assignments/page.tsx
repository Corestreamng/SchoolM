"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUp, CalendarDays } from "lucide-react";
import DashboardLayout from "@/app/dashboard-layout";
import { useAssignments } from "@/hooks/use-assignments";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  published: { label: "Published", color: "bg-yellow-100 text-yellow-800" },
  closed: { label: "Closed", color: "bg-green-100 text-green-800" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function AssignmentsPage() {
  const { user } = useAuth();
  const classId = user?.student?.class_id;

  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: assignmentsData, isLoading } = useAssignments(
    classId ? { class_id: classId, per_page: 1000 } : undefined
  );

  const assignments = assignmentsData?.data || [];

  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(
      assignments.map((a) => a.subject?.name).filter(Boolean)
    );
    return ["all", ...Array.from(uniqueSubjects)];
  }, [assignments]);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const subjectMatch =
        filterSubject === "all" || a.subject?.name === filterSubject;
      const statusMatch = filterStatus === "all" || a.status === filterStatus;
      return subjectMatch && statusMatch;
    });
  }, [assignments, filterSubject, filterStatus]);

  const statuses = ["all", "draft", "published", "closed"];

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { staggerChildren: 0.1 } }}
        className="space-y-6"
      >
        <motion.div variants={cardVariants}>
          <div>
            <h1 className="text-3xl font-bold mb-2">Assignments</h1>
            <p className="text-muted-foreground">
              Track your assignment progress and submissions
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">
                    Filter by Subject
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <Button
                        key={subject}
                        variant={
                          filterSubject === subject ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setFilterSubject(subject)}
                      >
                        {subject === "all" ? "All Subjects" : subject}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Filter by Status</p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <Button
                        key={status}
                        variant={
                          filterStatus === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setFilterStatus(status)}
                      >
                        {status === "all"
                          ? "All Status"
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assignments List */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Loading assignments...</p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">No assignments found</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div className="space-y-3">
            {filtered.map((assignment) => {
              const submission = assignment.submissions?.find((s) => s.id); // Get first submission if any
              const isSubmitted = !!submission;
              const isGraded = !!submission?.score;

              return (
                <motion.div key={assignment.id} variants={cardVariants}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">
                                {assignment.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {assignment.subject?.name || "Subject"}
                              </p>
                            </div>
                            <Badge
                              className={
                                statusConfig[
                                  assignment.status as keyof typeof statusConfig
                                ]?.color || "bg-gray-100 text-gray-800"
                              }
                            >
                              {statusConfig[
                                assignment.status as keyof typeof statusConfig
                              ]?.label || assignment.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarDays size={16} />
                              Due:{" "}
                              {format(
                                new Date(assignment.due_date),
                                "MMM d, yyyy"
                              )}
                            </div>
                            {isSubmitted && (
                              <div className="text-blue-600">Submitted</div>
                            )}
                            {isGraded && (
                              <div className="text-green-600 font-semibold">
                                Grade: {submission.score}/{assignment.max_score}
                              </div>
                            )}
                          </div>
                          {assignment.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                        {!isSubmitted && assignment.status === "published" && (
                          <Button variant="default" size="sm" className="gap-2">
                            <FileUp size={16} />
                            Submit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
