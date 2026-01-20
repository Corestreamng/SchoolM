"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useParentChildren } from "@/hooks/use-parents";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewChildrenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: number;
  parentName: string;
}

export default function ViewChildrenModal({
  open,
  onOpenChange,
  parentId,
  parentName,
}: ViewChildrenModalProps) {
  const { data, isLoading } = useParentChildren(parentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Children of {parentName}</DialogTitle>
          <DialogDescription>
            View all children linked to this parent account
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : data?.children && data.children.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.children.map((child) => (
                  <TableRow key={child.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {child.student_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {child.user?.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {child.user?.email || "N/A"}
                    </TableCell>
                    <TableCell>
                      {child.class ? (
                        <Badge variant="outline">{child.class.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Not assigned
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No children found for this parent
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
