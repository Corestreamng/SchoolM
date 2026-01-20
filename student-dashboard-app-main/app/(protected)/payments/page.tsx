"use client";

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
import { Download } from "lucide-react";
import DashboardLayout from "@/app/dashboard-layout";
import { usePayments } from "@/hooks/use-payments";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

const statusConfig = {
  completed: { label: "Paid", color: "bg-green-100 text-green-800" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  failed: { label: "Failed", color: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", color: "bg-orange-100 text-orange-800" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const studentId = user?.student?.id;

  const { data: paymentsData, isLoading } = usePayments(
    studentId ? { student_id: studentId, per_page: 1000 } : undefined
  );

  const payments = paymentsData?.data || [];

  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalAmount = totalPaid + totalPending;
  const paymentStatus =
    totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={cardVariants}>
          <div>
            <h1 className="text-3xl font-bold mb-2">Payment Status</h1>
            <p className="text-muted-foreground">
              View and manage your school fees
            </p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={cardVariants}>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Total Paid</p>
                <p className="text-3xl font-bold text-green-600">
                  ₦{totalPaid.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Total Pending
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  ₦{totalPending.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Payment Status
                </p>
                <p className="text-3xl font-bold text-primary">
                  {paymentStatus}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Payments Table */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>All your school fee payments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading payments...
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payment records found
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <motion.div
                      key={payment.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{payment.payment_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Due:{" "}
                          {payment.due_date
                            ? format(new Date(payment.due_date), "MMM d, yyyy")
                            : "N/A"}
                        </p>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">
                            ₦{payment.amount.toLocaleString()}
                          </p>
                          {payment.paid_date && (
                            <p className="text-xs text-muted-foreground">
                              Paid:{" "}
                              {format(
                                new Date(payment.paid_date),
                                "MMM d, yyyy"
                              )}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={
                            statusConfig[
                              payment.status as keyof typeof statusConfig
                            ]?.color || "bg-gray-100 text-gray-800"
                          }
                        >
                          {statusConfig[
                            payment.status as keyof typeof statusConfig
                          ]?.label || payment.status}
                        </Badge>
                        {payment.status === "completed" && (
                          <Button variant="ghost" size="sm">
                            <Download size={16} />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
