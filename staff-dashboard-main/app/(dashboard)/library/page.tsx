"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Book, RotateCcw } from "lucide-react"

const books = [
  {
    title: "Advanced Mathematics Vol. 1",
    author: "Dr. Smith",
    isbn: "978-1234567890",
    total: 5,
    available: 3,
    status: "available",
  },
  {
    title: "English Literature Essentials",
    author: "Prof. Johnson",
    isbn: "978-0987654321",
    total: 8,
    available: 0,
    status: "borrowed",
  },
  {
    title: "Science Fundamentals",
    author: "Dr. Williams",
    isbn: "978-1357924680",
    total: 6,
    available: 2,
    status: "available",
  },
]

export default function LibraryPage() {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Library Management</h1>
          <p className="text-muted-foreground mt-1">Manage library books and borrowing</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          Add Book
        </button>
      </div>

      <div className="space-y-4">
        {books.map((book, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-card rounded-lg p-6 border border-border shadow-sm"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Book className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{book.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">by {book.author}</p>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground">ISBN</p>
                    <p className="font-medium text-foreground">{book.isbn}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Available / Total</p>
                    <p className="font-medium text-foreground">
                      {book.available} / {book.total}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={book.status === "available" ? "default" : "outline"} className="capitalize">
                      {book.status}
                    </Badge>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <RotateCcw size={18} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
