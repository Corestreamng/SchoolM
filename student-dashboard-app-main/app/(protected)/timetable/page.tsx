"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/app/dashboard-layout";
import { useTimetables } from "@/hooks/use-timetables";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function TimetablePage() {
  const { user } = useAuth();
  const classId = user?.student?.class_id;

  const { data: timetables, isLoading } = useTimetables(
    classId ? { class_id: classId } : undefined
  );

  // Group timetables by day
  const timetableByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = (timetables || [])
      .filter((t) => t.day_of_week?.toLowerCase() === day.toLowerCase())
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {} as Record<string, typeof timetables>);

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={cardVariants}>
          <div>
            <h1 className="text-3xl font-bold mb-2">Personal Timetable</h1>
            <p className="text-muted-foreground">Your weekly class schedule</p>
          </div>
        </motion.div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Loading timetable...</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div className="space-y-4">
            {daysOfWeek.map((day, idx) => {
              const dayTimetable = timetableByDay[day] || [];

              if (dayTimetable.length === 0) return null;

              return (
                <motion.div key={idx} variants={cardVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{day}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dayTimetable.map((entry) => {
                          const startTime = format(
                            new Date(`2000-01-01T${entry.start_time}`),
                            "h:mm a"
                          );
                          const endTime = format(
                            new Date(`2000-01-01T${entry.end_time}`),
                            "h:mm a"
                          );

                          return (
                            <motion.div
                              key={entry.id}
                              whileHover={{ scale: 1.02 }}
                              className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border hover:border-primary/30 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {entry.subject?.name || "Subject"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {startTime} - {endTime}
                                  </p>
                                </div>
                                {entry.room && (
                                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                                    Room {entry.room}
                                  </span>
                                )}
                              </div>
                              {entry.teacher?.user?.name && (
                                <p className="text-sm text-muted-foreground">
                                  with {entry.teacher.user.name}
                                </p>
                              )}
                            </motion.div>
                          );
                        })}
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
