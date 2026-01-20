"use client"

import { motion } from "framer-motion"
import { Edit, Trash2 } from "lucide-react"
import { useState } from "react"

const feeStructure = [
  { id: 1, name: "Tuition Fee", amount: 500000, applies: "All Classes" },
  { id: 2, name: "Development Levy", amount: 50000, applies: "Form 1-3" },
  { id: 3, name: "Technology Fee", amount: 30000, applies: "All Classes" },
  { id: 4, name: "Sports Fee", amount: 20000, applies: "All Classes" },
  { id: 5, name: "Library Fee", amount: 15000, applies: "All Classes" },
]

export default function FeeStructurePage() {
  const [fees, setFees] = useState(feeStructure)

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Structure</h1>
          <p className="text-muted-foreground mt-1">Manage school fees and charges</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          Add Fee Type
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground">Total Annual Fee</p>
          <p className="text-3xl font-bold text-foreground mt-2">₦615,000</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground">Number of Fee Types</p>
          <p className="text-3xl font-bold text-foreground mt-2">{fees.length}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm text-muted-foreground">Last Updated</p>
          <p className="text-3xl font-bold text-foreground mt-2">Jan 2025</p>
        </div>
      </motion.div>

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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fee Type</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Amount (₦)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Applies To</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, idx) => (
                <motion.tr
                  key={fee.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ backgroundColor: "var(--secondary)" }}
                  className="border-b border-border last:border-0 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{fee.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground text-right">
                    ₦{fee.amount.toLocaleString("en-NG")}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{fee.applies}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-background rounded-lg transition-colors">
                        <Edit size={18} className="text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-background rounded-lg transition-colors">
                        <Trash2 size={18} className="text-destructive" />
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
