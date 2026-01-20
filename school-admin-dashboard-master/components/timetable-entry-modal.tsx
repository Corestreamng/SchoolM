"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSubjects } from "@/hooks/use-subjects";
import { useTeachers } from "@/hooks/use-teachers";
import {
  useCreateTimetableEntry,
  useUpdateTimetableEntry,
} from "@/hooks/use-timetable";
import { useToast } from "@/hooks/use-toast";
import type { TimetableEntry } from "@/lib/api/timetable";

interface TimetableEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  day?: string;
  timeSlot?: string;
  entry?: TimetableEntry | null;
}

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

export default function TimetableEntryModal({
  open,
  onOpenChange,
  classId,
  day,
  timeSlot,
  entry,
}: TimetableEntryModalProps) {
  const [formData, setFormData] = useState({
    subject_id: "",
    teacher_id: "",
    day: "",
    start_time: "",
    end_time: "",
    room: "",
  });

  const queryClient = useQueryClient();
  const { data: subjectsData } = useSubjects();
  const { data: teachersData } = useTeachers();
  const createEntry = useCreateTimetableEntry();
  const updateEntry = useUpdateTimetableEntry();
  const { toast } = useToast();

  const subjects = subjectsData?.data || [];
  const teachers = teachersData?.data || [];

  useEffect(() => {
    if (entry) {
      setFormData({
        subject_id: entry.subject_id.toString(),
        teacher_id: entry.teacher_id?.toString() || "",
        day: entry.day,
        start_time: entry.start_time,
        end_time: entry.end_time,
        room: entry.room || "",
      });
    } else {
      setFormData({
        subject_id: "",
        teacher_id: "",
        day: day || "",
        start_time: timeSlot || "",
        end_time: timeSlot ? calculateEndTime(timeSlot) : "",
        room: "",
      });
    }
  }, [entry, day, timeSlot, open]);

  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHour = hours + 1;
    return `${endHour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (
      !formData.subject_id ||
      !formData.day ||
      !formData.start_time ||
      !formData.end_time
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (entry) {
        await updateEntry.mutateAsync({
          id: entry.id,
          data: {
            subject_id: parseInt(formData.subject_id),
            teacher_id: formData.teacher_id
              ? parseInt(formData.teacher_id)
              : undefined,
            start_time: formData.start_time,
            end_time: formData.end_time,
            room: formData.room || undefined,
          },
        });
        toast({
          title: "Success",
          description: "Timetable entry updated successfully",
        });
        // Invalidate timetable queries for the specific class if entry has class_id, otherwise invalidate all
        if (entry.class_id) {
          queryClient.invalidateQueries({
            queryKey: ["timetable", "class", entry.class_id],
          });
        } else {
          queryClient.invalidateQueries({ queryKey: ["timetable"] });
        }
      } else {
        await createEntry.mutateAsync({
          class_id: classId,
          subject_id: parseInt(formData.subject_id),
          teacher_id: formData.teacher_id
            ? parseInt(formData.teacher_id)
            : undefined,
          day: formData.day,
          start_time: formData.start_time,
          end_time: formData.end_time,
          room: formData.room || undefined,
        });
        toast({
          title: "Success",
          description: "Timetable entry added successfully",
        });
        // Invalidate the specific class timetable query
        queryClient.invalidateQueries({
          queryKey: ["timetable", "class", classId],
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to save timetable entry",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit Timetable Entry" : "Add Timetable Entry"}
          </DialogTitle>
          <DialogDescription>
            {entry
              ? "Update the timetable entry details"
              : "Add a new subject to the timetable"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select
              value={formData.subject_id}
              onValueChange={(value) =>
                setFormData({ ...formData, subject_id: value })
              }
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <Select
              value={formData.teacher_id}
              onValueChange={(value) =>
                setFormData({ ...formData, teacher_id: value })
              }
            >
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Select a teacher (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">No teacher assigned</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    {teacher.user?.name || teacher.teacher_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day">Day *</Label>
            <Select
              value={formData.day}
              onValueChange={(value) =>
                setFormData({ ...formData, day: value })
              }
            >
              <SelectTrigger id="day">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Select
                value={formData.start_time}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    start_time: value,
                    end_time: calculateEndTime(value),
                  });
                }}
              >
                <SelectTrigger id="start_time">
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Room</Label>
            <Input
              id="room"
              placeholder="Room number (optional)"
              value={formData.room}
              onChange={(e) =>
                setFormData({ ...formData, room: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              createEntry.isPending ||
              updateEntry.isPending ||
              !formData.subject_id ||
              !formData.day ||
              !formData.start_time ||
              !formData.end_time
            }
          >
            {createEntry.isPending || updateEntry.isPending
              ? "Saving..."
              : entry
              ? "Update Entry"
              : "Add Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
