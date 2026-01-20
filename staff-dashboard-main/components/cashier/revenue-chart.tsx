"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePayments } from "@/hooks/use-payments";
import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";

export function RevenueChart() {
  const { data: paymentsData } = usePayments({ per_page: 1000 });
  const payments = paymentsData?.data || [];

  const data = useMemo(() => {
    const sixMonthsAgo = subMonths(new Date(), 6);
    const months = eachMonthOfInterval({
      start: sixMonthsAgo,
      end: new Date(),
    });

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthPayments = payments.filter((p) => {
        if (!p.paid_date || p.status !== "completed") return false;
        const paidDate = new Date(p.paid_date);
        return paidDate >= monthStart && paidDate <= monthEnd;
      });

      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        month: format(month, "MMM"),
        revenue: Math.round(revenue),
      };
    });
  }, [payments]);

  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Revenue Trend
      </h3>
      {data.length > 0 && data.some((d) => d.revenue > 0) ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "0.625rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(value: number) => `₦${value.toLocaleString()}`}
            />
            <Bar
              dataKey="revenue"
              fill="var(--chart-1)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No revenue data available
        </div>
      )}
    </div>
  );
}
