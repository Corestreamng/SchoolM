"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Suspense, useState } from "react";
import { usePayments } from "@/hooks/use-payments";
import { format } from "date-fns";

function PaymentsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: paymentsData, isLoading } = usePayments({ per_page: 1000 });
  const payments = paymentsData?.data || [];

  const filtered = payments.filter((payment) => {
    const matchesSearch =
      payment.student?.user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.student?.class?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.payment_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground mt-1">
          View and manage payment records
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by student, class, or payment type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-background border border-border text-foreground"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading payments...
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Payment Type
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filtered.map((payment, idx) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ backgroundColor: "var(--secondary)" }}
                      className="border-b border-border last:border-0 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {payment.student?.user?.name ||
                          `Student ${
                            payment.student?.student_id || payment.student_id
                          }`}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {payment.student?.class?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {payment.payment_type}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground text-right">
                        ₦{payment.amount.toLocaleString("en-NG")}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {payment.paid_date
                          ? format(new Date(payment.paid_date), "MMM d, yyyy")
                          : payment.due_date
                          ? format(new Date(payment.due_date), "MMM d, yyyy")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {payment.payment_method || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "pending"
                              ? "outline"
                              : "destructive"
                          }
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No payments found matching your search
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentsContent />
    </Suspense>
  );
}
