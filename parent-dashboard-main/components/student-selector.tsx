"use client";

import { useStudents } from "@/hooks/use-students";
import { ArrowDown2 } from "iconsax-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudentSelectorProps {
  selectedStudentId?: number;
  onSelect?: (studentId: number) => void;
}

export function StudentSelector({
  selectedStudentId,
  onSelect,
}: StudentSelectorProps) {
  const { data: studentsData, isLoading } = useStudents();
  const students = studentsData?.data || [];
  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  if (isLoading || students.length === 0) {
    return <div className="text-sm text-slate-500">Loading students...</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
        <Image
          src={selectedStudent?.user?.avatar || "/placeholder.svg"}
          alt={selectedStudent?.user?.name || "Student"}
          width={28}
          height={28}
          className="rounded-full"
        />
        <div className="text-left">
          <p className="text-sm font-medium text-slate-900">
            {selectedStudent?.user?.name || "N/A"}
          </p>
          <p className="text-xs text-slate-500">
            {selectedStudent?.class?.name || "No Class"}
          </p>
        </div>
        <ArrowDown2 size={16} className="text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {students.map((student) => (
          <DropdownMenuItem
            key={student.id}
            onClick={() => onSelect?.(student.id)}
            className={selectedStudent?.id === student.id ? "bg-blue-50" : ""}
          >
            <Image
              src={student.user?.avatar || "/placeholder.svg"}
              alt={student.user?.name || "Student"}
              width={24}
              height={24}
              className="rounded-full mr-2"
            />
            <div>
              <p className="text-sm font-medium">
                {student.user?.name || "N/A"}
              </p>
              <p className="text-xs text-slate-500">
                {student.class?.name || "No Class"}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
