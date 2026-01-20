"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { usePayments } from "@/hooks/use-payments";
import { useMemo } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

export function CashierOverviewCards() {
  const { data: paymentsData } = usePayments({ per_page: 1000 });
  const payments = paymentsData?.data || [];

  const stats = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = payments.filter(
      (p) => p.status === "pending"
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = payments.filter((p) => {
      if (!p.paid_date) return false;
      const paidDate = new Date(p.paid_date);
      paidDate.setHours(0, 0, 0, 0);
      return paidDate.getTime() === today.getTime() && p.status === "completed";
    });
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    const completedCount = payments.filter(
      (p) => p.status === "completed"
    ).length;

    return {
      totalRevenue,
      todayRevenue,
      pendingPayments,
      completedCount,
    };
  }, [payments]);

  const cards = [
    {
      label: "Total Revenue",
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      subtext: "All time",
      icon: DollarSign,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Today's Revenue",
      value: `₦${stats.todayRevenue.toLocaleString()}`,
      subtext: "Today",
      icon: TrendingUp,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Pending Payments",
      value: stats.pendingPayments.toString(),
      subtext: "Awaiting processing",
      icon: Clock,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      label: "Completed",
      value: stats.completedCount.toString(),
      subtext: "Total transactions",
      icon: CheckCircle,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="bg-card rounded-lg p-6 border border-border shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className={`${card.iconColor} w-6 h-6`} />
              </div>
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-1">
              {card.label}
            </p>
            <h3 className="text-3xl font-bold text-foreground">{card.value}</h3>
            <p className="text-xs text-muted-foreground mt-2">{card.subtext}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
