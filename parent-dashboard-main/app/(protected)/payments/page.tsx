"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSelector } from "@/components/student-selector";
import { TickCircle, Clock, Warning2, CloseCircle } from "iconsax-react";
import { useState, useEffect } from "react";
import { usePayments } from "@/hooks/use-payments";
import { useStudents } from "@/hooks/use-students";
import { format } from "date-fns";

const statusBadges = {
  completed: { bg: "bg-green-100", text: "text-green-700", icon: TickCircle },
  pending: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
  failed: { bg: "bg-red-100", text: "text-red-700", icon: CloseCircle },
  refunded: { bg: "bg-orange-100", text: "text-orange-700", icon: Warning2 },
};

export default function Payments() {
  const { data: studentsData } = useStudents();
  const students = studentsData?.data || [];
  const [selectedStudentId, setSelectedStudentId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const { data: paymentsData, isLoading } = usePayments(
    selectedStudentId
      ? { student_id: selectedStudentId, per_page: 1000 }
      : undefined
  );

  const payments = paymentsData?.data || [];

  const totals = {
    completed: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    failed: payments
      .filter((p) => p.status === "failed")
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Fee Payment Management
        </h1>
        <p className="text-slate-600 mt-2">Manage and track payment status</p>
      </div>

      <div className="flex justify-end">
        <StudentSelector
          selectedStudentId={selectedStudentId}
          onSelect={setSelectedStudentId}
        />
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-2">Paid</p>
            <p className="text-2xl font-bold text-green-600">
              ₦{totals.completed.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-2">Pending</p>
            <p className="text-2xl font-bold text-blue-600">
              ₦{totals.pending.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500 mb-2">Failed</p>
            <p className="text-2xl font-bold text-red-600">
              ₦{totals.failed.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No payment records found
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const statusBadge =
                  statusBadges[payment.status as keyof typeof statusBadges] ||
                  statusBadges.pending;
                const StatusIcon = statusBadge.icon;
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${statusBadge.bg}`}>
                        <StatusIcon size={20} className={statusBadge.text} />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {payment.payment_type}
                        </h4>
                        {payment.due_date && (
                          <p className="text-xs text-slate-500">
                            Due:{" "}
                            {format(new Date(payment.due_date), "MMM d, yyyy")}
                          </p>
                        )}
                        {payment.paid_date && (
                          <p className="text-xs text-slate-500">
                            Paid:{" "}
                            {format(new Date(payment.paid_date), "MMM d, yyyy")}
                          </p>
                        )}
                        {payment.transaction_id && (
                          <p className="text-xs text-slate-500">
                            Transaction ID: {payment.transaction_id}
                          </p>
                        )}
                        {payment.notes && (
                          <p className="text-xs text-slate-500 mt-1">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        ₦{payment.amount.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs font-medium ${statusBadge.text}`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
