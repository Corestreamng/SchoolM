"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Users } from "lucide-react";
import { useTimetables } from "@/hooks/use-timetables";
import { useAuth } from "@/context/auth-context";
import { format } from "date-fns";
import { useStudents } from "@/hooks/use-students";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SchedulePage() {
  const { user } = useAuth();
  const teacherId = user?.teacher?.id;

  const { data: timetables, isLoading } = useTimetables(
    teacherId ? { teacher_id: teacherId, per_page: 1000 } : undefined
  );

  // Group timetables by day
  const scheduleByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = (timetables || [])
      .filter((t) => t.day_of_week?.toLowerCase() === day.toLowerCase())
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {} as Record<string, typeof timetables>);

  // Get student counts for each class
  const classIds = [...new Set((timetables || []).map((t) => t.class_id))];
  const classStudentCounts: Record<number, number> = {};

  classIds.forEach((classId) => {
    // This would ideally be batched, but for now we'll fetch individually if needed
    // For now, we'll use a placeholder or fetch on demand
  });

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Class Schedule</h1>
        <p className="text-muted-foreground mt-1">
          Your weekly teaching schedule
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading schedule...
        </div>
      ) : (
        <div className="space-y-6">
          {daysOfWeek.map((day, dayIndex) => {
            const daySchedule = scheduleByDay[day] || [];
            if (daySchedule.length === 0) return null;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
                className="bg-card rounded-lg border border-border overflow-hidden"
              >
                <div className="bg-primary/5 px-6 py-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">{day}</h2>
                </div>
                <div className="divide-y divide-border">
                  {daySchedule.map((entry, clsIndex) => {
                    const startTime = format(
                      new Date(`2000-01-01T${entry.start_time}`),
                      "HH:mm"
                    );
                    const endTime = format(
                      new Date(`2000-01-01T${entry.end_time}`),
                      "HH:mm"
                    );

                    return (
                      <motion.div
                        key={entry.id}
                        whileHover={{ backgroundColor: "var(--secondary)" }}
                        className="p-6 transition-colors"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Time
                              </p>
                              <p className="font-semibold text-foreground">
                                {startTime} - {endTime}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Class
                            </p>
                            <p className="font-semibold text-foreground">
                              {entry.class?.name || "N/A"} -{" "}
                              {entry.subject?.name || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-accent" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Room
                              </p>
                              <p className="font-semibold text-foreground">
                                {entry.room || "TBD"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={18} className="text-accent" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Subject
                              </p>
                              <p className="font-semibold text-foreground">
                                {entry.subject?.code ||
                                  entry.subject?.name ||
                                  "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
          {Object.keys(scheduleByDay).every(
            (day) => scheduleByDay[day].length === 0
          ) && (
            <div className="text-center py-12 text-muted-foreground">
              No schedule entries found
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
