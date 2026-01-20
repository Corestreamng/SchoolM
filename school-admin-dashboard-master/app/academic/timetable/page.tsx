"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useTimetableByClass,
  useDeleteTimetableEntry,
} from "@/hooks/use-timetable";
import { useClasses } from "@/hooks/use-classes";
import { Skeleton } from "@/components/ui/skeleton";
import TimetableEntryModal from "@/components/timetable-entry-modal";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { Add, Trash, Edit } from "iconsax-react";
import type { TimetableEntry } from "@/lib/api/timetable";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
];

//v%VV-YYEp1koOivl

export default function TimetablePage() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(
    null
  );
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  const { data: classesData } = useClasses();
  const classes = classesData?.data || [];
  const deleteEntry = useDeleteTimetableEntry();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: timetableEntries, isLoading } = useTimetableByClass(
    selectedClassId || 0
  );

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCellData = (day: string, timeSlot: string) => {
    if (!timetableEntries) return null;
    return timetableEntries.find(
      (entry) =>
        entry.day.toLowerCase() === day.toLowerCase() &&
        entry.start_time === timeSlot
    );
  };

  const handleCellClick = (day: string, timeSlot: string) => {
    if (!selectedClassId) return;
    const existingEntry = getCellData(day, timeSlot);
    if (existingEntry) {
      setSelectedEntry(existingEntry);
      setSelectedDay("");
      setSelectedTimeSlot("");
    } else {
      setSelectedEntry(null);
      setSelectedDay(day);
      setSelectedTimeSlot(timeSlot);
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, entry: TimetableEntry) => {
    e.stopPropagation();
    setEntryToDelete(entry.id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    try {
      await deleteEntry.mutateAsync(entryToDelete);
      toast({
        title: t("common.success"),
        description: t("timetable.entryDeleted"),
      });
      setIsDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description:
          error?.response?.data?.message ||
          t("timetable.deleteFailed") ||
          "Failed to delete timetable entry",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopNav />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t("timetable.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("timetable.description") ||
                  "View and manage class schedules"}
              </p>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("timetable.classSchedule")}</CardTitle>
                  <div className="flex items-center gap-4">
                    <Select
                      value={selectedClassId?.toString() || ""}
                      onValueChange={(value) =>
                        setSelectedClassId(value ? parseInt(value) : null)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t("timetable.selectClass")} />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedClassId && (
                      <Button
                        onClick={() => {
                          setSelectedEntry(null);
                          setSelectedDay("");
                          setSelectedTimeSlot("");
                          setIsModalOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Add size={18} color="white" />
                        {t("timetable.addSubject")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedClassId ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {t("timetable.selectClassToView")}
                  </div>
                ) : isLoading ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="p-3 text-left font-medium">
                            {t("timetable.time")}
                          </th>
                          {days.map((day) => (
                            <th
                              key={day}
                              className="p-3 text-center font-medium"
                            >
                              {t(`timetable.${day.toLowerCase()}`) || day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((timeSlot) => (
                          <tr
                            key={timeSlot}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="p-3 font-medium text-muted-foreground">
                              {formatTime(timeSlot)}
                            </td>
                            {days.map((day) => {
                              const cellData = getCellData(day, timeSlot);
                              return (
                                <td
                                  key={`${day}-${timeSlot}`}
                                  className="p-2 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                                  onClick={() => handleCellClick(day, timeSlot)}
                                >
                                  {cellData ? (
                                    <div className="bg-primary/10 p-2 rounded border border-primary/20 relative group">
                                      <div className="font-medium text-sm">
                                        {cellData.subject?.name || "N/A"}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {cellData.teacher?.user?.name ||
                                          t("timetable.noTeacher")}
                                      </div>
                                      {cellData.room && (
                                        <div className="text-xs text-muted-foreground">
                                          {t("timetable.room")} {cellData.room}
                                        </div>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) =>
                                          handleDeleteClick(e, cellData)
                                        }
                                      >
                                        <Trash
                                          size={14}
                                          className="text-destructive"
                                        />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="text-muted-foreground py-2">
                                      {t("timetable.clickToAdd")}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedClassId && (
              <TimetableEntryModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                classId={selectedClassId}
                day={selectedDay}
                timeSlot={selectedTimeSlot}
                entry={selectedEntry}
              />
            )}

            <DeleteConfirmDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              onConfirm={handleDeleteConfirm}
              title={t("timetable.deleteEntry")}
              description={
                t("timetable.deleteConfirm") ||
                "Are you sure you want to remove this subject from the timetable? This action cannot be undone."
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}
