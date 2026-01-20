"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { usePayments } from "@/hooks/use-payments";
import { format } from "date-fns";

export function RecentTransactions() {
  const { data: paymentsData } = usePayments({ per_page: 20 });
  const payments = paymentsData?.data || [];

  const recentPayments = payments
    .sort((a, b) => {
      const dateA = new Date(a.paid_date || a.created_at || 0);
      const dateB = new Date(b.paid_date || b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "pending":
        return Clock;
      case "failed":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-orange-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Recent Transactions
      </h3>
      {recentPayments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recent transactions
        </div>
      ) : (
        <div className="space-y-4">
          {recentPayments.map((payment, index) => {
            const Icon = getStatusIcon(payment.status);
            const iconColor = getStatusColor(payment.status);

            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
              >
                <Icon className={`${iconColor} w-5 h-5 mt-1 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {payment.student?.user?.name ||
                      `Student ${payment.student_id}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {payment.payment_type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground text-sm">
                    ₦{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.paid_date
                      ? format(new Date(payment.paid_date), "MMM d")
                      : format(
                          new Date(payment.created_at || Date.now()),
                          "MMM d"
                        )}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
