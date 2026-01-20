"use client";

import { useAuth } from "@/context/auth-context";
import { OverviewCards } from "@/components/teacher/overview-cards";
import { PerformanceChart } from "@/components/teacher/performance-chart";
import { RecentActivity } from "@/components/teacher/recent-activity";
import { CashierOverviewCards } from "@/components/cashier/cashier-overview-cards";
import { RevenueChart } from "@/components/cashier/revenue-chart";
import { RecentTransactions } from "@/components/cashier/recent-transactions";
import { useLanguage } from "@/context/language-context";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("dashboard.welcome")} {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === "teacher"
            ? t("dashboard.teacherOverview") ||
              "Here's your teaching overview for today"
            : t("dashboard.cashierOverview") ||
              "Here's your financial overview"}
        </p>
      </div>

      {user?.role === "teacher" && (
        <>
          <OverviewCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChart />
            </div>
            <div>
              <RecentActivity />
            </div>
          </div>
        </>
      )}

      {user?.role === "cashier" && (
        <>
          <CashierOverviewCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <RecentTransactions />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
