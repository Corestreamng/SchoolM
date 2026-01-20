"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

const exams = [
  {
    title: "Form 3 End of Term Mathematics",
    date: "2025-01-20",
    duration: "2 hours",
    students: 35,
    status: "upcoming",
  },
  {
    title: "Form 2 Midterm Science",
    date: "2025-01-15",
    duration: "1.5 hours",
    students: 38,
    status: "upcoming",
  },
  {
    title: "Form 1 Weekly Quiz - English",
    date: "2025-01-10",
    duration: "30 minutes",
    students: 40,
    status: "completed",
  },
]

export default function CBTPage() {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CBT Management</h1>
          <p className="text-muted-foreground mt-1">Manage computer-based tests and exams</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          Create New Exam
        </button>
      </div>

      <div className="space-y-4">
        {exams.map((exam, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-card rounded-lg p-6 border border-border shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground">{exam.title}</h3>
                  <Badge variant={exam.status === "completed" ? "default" : "outline"} className="capitalize">
                    {exam.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{exam.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">{exam.duration}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Students</p>
                    <p className="font-medium text-foreground">{exam.students}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  View
                </button>
                {exam.status === "completed" && (
                  <button className="px-4 py-2 text-sm bg-secondary text-foreground border border-border rounded-lg hover:bg-muted transition-colors">
                    Results
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
