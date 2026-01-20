"use client"

import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const monthlyData = [
  { month: "Sep", collected: 4500000, target: 5000000 },
  { month: "Oct", collected: 5100000, target: 5000000 },
  { month: "Nov", collected: 6200000, target: 5000000 },
  { month: "Dec", collected: 7100000, target: 5000000 },
  { month: "Jan", collected: 8450000, target: 5000000 },
]

const classData = [
  { name: "Form 1", value: 2100000 },
  { name: "Form 2", value: 2850000 },
  { name: "Form 3", value: 3500000 },
]

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]

export default function ReportsPage() {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transaction Reports</h1>
        <p className="text-muted-foreground mt-1">View detailed financial reports and analytics</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: `1px solid var(--border)`,
                  borderRadius: "0.625rem",
                }}
              />
              <Legend />
              <Bar dataKey="collected" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Revenue by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={classData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ₦${(value / 1000000).toFixed(1)}M`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {classData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 0,
                  }).format(value as number)
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground">Total Collected (Current Term)</p>
          <p className="text-2xl font-bold text-foreground mt-2">₦45.8M</p>
          <p className="text-xs text-accent mt-2">↑ 12% from last term</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
          <p className="text-2xl font-bold text-foreground mt-2">₦2.5M</p>
          <p className="text-xs text-destructive mt-2">↑ 8% increase</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground">Collection Rate</p>
          <p className="text-2xl font-bold text-foreground mt-2">94.8%</p>
          <p className="text-xs text-accent mt-2">↑ 5% improvement</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
