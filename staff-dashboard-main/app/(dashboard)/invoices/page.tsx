"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Download, Eye } from "lucide-react"

const invoices = [
  {
    id: "INV-001",
    student: "Amara Johnson",
    class: "Form 3A",
    amount: 150000,
    issueDate: "2025-01-10",
    dueDate: "2025-01-15",
    status: "paid",
  },
  {
    id: "INV-002",
    student: "Benjamin Okafor",
    class: "Form 2B",
    amount: 120000,
    issueDate: "2025-01-09",
    dueDate: "2025-01-14",
    status: "paid",
  },
  {
    id: "INV-003",
    student: "Chioma Nwankwo",
    class: "Form 3C",
    amount: 100000,
    issueDate: "2025-01-08",
    dueDate: "2025-01-13",
    status: "pending",
  },
  {
    id: "INV-004",
    student: "Daniel Adeyemi",
    class: "Form 1A",
    amount: 100000,
    issueDate: "2025-01-07",
    dueDate: "2025-01-12",
    status: "overdue",
  },
]

export default function InvoicesPage() {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices & Billing</h1>
          <p className="text-muted-foreground mt-1">Generate and manage student invoices</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          Generate Invoice
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Invoice ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Class</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, idx) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ backgroundColor: "var(--secondary)" }}
                  className="border-b border-border last:border-0 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{invoice.student}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{invoice.class}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground text-right">
                    ₦{invoice.amount.toLocaleString("en-NG")}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.dueDate}</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge
                      variant={
                        invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "outline"
                      }
                      className="capitalize"
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-background rounded-lg transition-colors">
                        <Eye size={18} className="text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-background rounded-lg transition-colors">
                        <Download size={18} className="text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
