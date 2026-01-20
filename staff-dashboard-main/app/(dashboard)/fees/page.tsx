"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { User, DollarSign } from "lucide-react"

const students = [
  { id: 1, name: "Amara Johnson", class: "Form 3A", balance: 150000 },
  { id: 2, name: "Benjamin Okafor", class: "Form 2B", balance: 120000 },
  { id: 3, name: "Chioma Nwankwo", class: "Form 3C", balance: 0 },
  { id: 4, name: "Daniel Adeyemi", class: "Form 1A", balance: 100000 },
]

export default function FeesPage() {
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")

  const student = students.find((s) => s.id === Number(selectedStudent))

  const handleSubmit = () => {
    if (selectedStudent && amount && paymentMethod) {
      console.log("Processing payment:", { student: selectedStudent, amount, method: paymentMethod })
      setSelectedStudent("")
      setAmount("")
      setPaymentMethod("")
    }
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fee Collection</h1>
        <p className="text-muted-foreground mt-1">Collect student fees and process payments</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 bg-card rounded-lg p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-6">New Payment</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} - {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {student && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-secondary rounded-lg p-4 border border-border"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Class</p>
                    <p className="font-medium text-foreground">{student.class}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding Balance</p>
                    <p className="font-semibold text-foreground">₦{student.balance.toLocaleString("en-NG")}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Amount (₦)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="mobile">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedStudent || !amount || !paymentMethod}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Payment
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign size={20} className="text-accent" />
              <h3 className="font-semibold text-foreground">Today's Collection</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">₦2,450,000</p>
            <p className="text-xs text-muted-foreground mt-2">12 payments processed</p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <User size={20} className="text-primary" />
              <h3 className="font-semibold text-foreground">Outstanding</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">₦2,500,000</p>
            <p className="text-xs text-muted-foreground mt-2">12 students</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
