"use client"

import { motion } from "framer-motion"

export function CardSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
      className="bg-secondary rounded-lg p-6 border border-border h-32"
    />
  )
}

export function TableSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="h-12 bg-secondary border-b border-border" />
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: i * 0.1 }}
          className="h-16 border-b border-border bg-card"
        />
      ))}
    </div>
  )
}
