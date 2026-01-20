"use client";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useCreateClass } from "@/hooks/use-classes";
import { useTeachers } from "@/hooks/use-teachers";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

interface AddClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddClassModal({
  open,
  onOpenChange,
}: AddClassModalProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const createClass = useCreateClass();
  const { data: teachersData } = useTeachers();
  const teachers = teachersData?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    level: "",
    class_teacher_id: "",
    second_class_teacher_id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.level) {
      toast({
        title: t("common.error"),
        description:
          t("common.fillRequiredFields") ||
          "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createClass.mutateAsync({
        name: formData.name,
        level: formData.level,
        class_teacher_id: formData.class_teacher_id
          ? parseInt(formData.class_teacher_id)
          : undefined,
        second_class_teacher_id: formData.second_class_teacher_id
          ? parseInt(formData.second_class_teacher_id)
          : undefined,
        status: "active",
      });

      toast({
        title: t("common.success"),
        description: t("classes.classAdded"),
      });

      onOpenChange(false);
      setFormData({
        name: "",
        level: "",
        class_teacher_id: "",
        second_class_teacher_id: "",
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description:
          error?.response?.data?.message ||
          t("classes.createFailed") ||
          "Failed to create class.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>{t("classes.addClass")}</DialogTitle>
          <DialogDescription>
            {t("classes.createClassDescription") ||
              "Create a new class and assign a teacher"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("common.className")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder={t("classes.classNamePlaceholder") || "e.g., JSS 1A"}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">
              {t("common.level")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="level"
              placeholder={
                t("classes.levelPlaceholder") ||
                "e.g., JSS 1, Primary 3, Nursery 2"
              }
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class_teacher_id">
              {t("classes.classTeacher")} 1
            </Label>
            <Select
              value={formData.class_teacher_id}
              onValueChange={(value) =>
                setFormData({ ...formData, class_teacher_id: value })
              }
            >
              <SelectTrigger id="class_teacher_id">
                <SelectValue placeholder={t("classes.selectTeacher")} />
              </SelectTrigger>
              <SelectContent>
                {teachers
                  .filter(
                    (teacher) =>
                      teacher.id.toString() !== formData.second_class_teacher_id
                  )
                  .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.user?.name || teacher.teacher_id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="second_class_teacher_id">
              {t("classes.classTeacher")} 2 (Optional)
            </Label>
            <Select
              value={formData.second_class_teacher_id}
              onValueChange={(value) =>
                setFormData({ ...formData, second_class_teacher_id: value })
              }
            >
              <SelectTrigger id="second_class_teacher_id">
                <SelectValue placeholder={t("classes.selectTeacher")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {teachers
                  .filter(
                    (teacher) =>
                      teacher.id.toString() !== formData.class_teacher_id
                  )
                  .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.user?.name || teacher.teacher_id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? t("common.creating") || "Creating..."
              : t("classes.addClass")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
