"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play } from "lucide-react";
import DashboardLayout from "@/app/dashboard-layout";

const cbtData = [
  {
    id: 1,
    title: "Mathematics Placement Test",
    subject: "Mathematics",
    duration: 120,
    totalQuestions: 50,
    status: "completed",
    score: 92,
    date: "2024-01-20",
  },
  {
    id: 2,
    title: "Physics Midterm Exam",
    subject: "Physics",
    duration: 90,
    totalQuestions: 40,
    status: "completed",
    score: 88,
    date: "2024-01-15",
  },
  {
    id: 3,
    title: "Chemistry Quiz",
    subject: "Chemistry",
    duration: 45,
    totalQuestions: 25,
    status: "available",
    score: null,
    date: "2024-02-01",
  },
  {
    id: 4,
    title: "Biology Final Exam",
    subject: "Biology",
    duration: 120,
    totalQuestions: 60,
    status: "available",
    score: null,
    date: "2024-02-10",
  },
];

const statusConfig = {
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  available: { label: "Available", color: "bg-blue-100 text-blue-800" },
  locked: { label: "Locked", color: "bg-gray-100 text-gray-800" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function CBTPage() {
  const [selectedExam, setSelectedExam] = useState<(typeof cbtData)[0] | null>(
    null
  );

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={cardVariants}>
          <div>
            <h1 className="text-3xl font-bold mb-2">Computer Based Tests</h1>
            <p className="text-muted-foreground">
              Take and review your online exams
            </p>
          </div>
        </motion.div>

        {/* Exams Grid */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cbtData.map((exam) => (
            <motion.div key={exam.id} variants={cardVariants}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle>{exam.title}</CardTitle>
                      <CardDescription>{exam.subject}</CardDescription>
                    </div>
                    <Badge
                      className={
                        statusConfig[exam.status as keyof typeof statusConfig]
                          .color
                      }
                    >
                      {
                        statusConfig[exam.status as keyof typeof statusConfig]
                          .label
                      }
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={16} className="text-primary" />
                        <p className="font-semibold">{exam.duration} minutes</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                      <p className="font-semibold mt-1">
                        {exam.totalQuestions} questions
                      </p>
                    </div>
                  </div>

                  {exam.status === "completed" && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm text-muted-foreground">
                        Your Score
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {exam.score}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed: {new Date(exam.date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={
                      exam.status === "completed" ? "outline" : "default"
                    }
                    onClick={() => setSelectedExam(exam)}
                  >
                    {exam.status === "completed" ? (
                      <>Review Results</>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        Start Exam
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Exam Modal / Details */}
        {selectedExam && (
          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedExam.title}</CardTitle>
                    <CardDescription>{selectedExam.subject}</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedExam(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-bold">{selectedExam.duration} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="font-bold">{selectedExam.totalQuestions}</p>
                  </div>
                  {selectedExam.status === "completed" && (
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="font-bold text-green-600">
                        {selectedExam.score}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
