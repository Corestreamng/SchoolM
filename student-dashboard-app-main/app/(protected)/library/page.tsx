"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import DashboardLayout from "@/app/dashboard-layout";

const booksData = [
  {
    id: 1,
    title: "Calculus Advanced Topics",
    author: "James Stewart",
    subject: "Mathematics",
    available: 3,
    total: 5,
    status: "available",
    borrowed: false,
    dueDate: null,
  },
  {
    id: 2,
    title: "Physics Principles",
    author: "David Halliday",
    subject: "Physics",
    available: 1,
    total: 4,
    status: "borrowed",
    borrowed: true,
    dueDate: "2024-02-15",
  },
  {
    id: 3,
    title: "English Literature Classics",
    author: "Multiple Authors",
    subject: "English",
    available: 2,
    total: 3,
    status: "available",
    borrowed: false,
    dueDate: null,
  },
  {
    id: 4,
    title: "Organic Chemistry Guide",
    author: "Paula Bruice",
    subject: "Chemistry",
    available: 0,
    total: 2,
    status: "unavailable",
    borrowed: false,
    dueDate: null,
  },
  {
    id: 5,
    title: "Biology: The Unity of Life",
    author: "Cecie Starr",
    subject: "Biology",
    available: 4,
    total: 4,
    status: "available",
    borrowed: true,
    dueDate: "2024-02-20",
  },
  {
    id: 6,
    title: "World History Overview",
    author: "Jackson Spielvogel",
    subject: "History",
    available: 2,
    total: 3,
    status: "available",
    borrowed: false,
    dueDate: null,
  },
];

const statusConfig = {
  available: { label: "Available", color: "bg-green-100 text-green-800" },
  borrowed: { label: "Borrowed", color: "bg-blue-100 text-blue-800" },
  unavailable: { label: "Unavailable", color: "bg-red-100 text-red-800" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function LibraryPage() {
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const subjects = ["all", ...new Set(booksData.map((b) => b.subject))];
  const statuses = ["all", "available", "borrowed", "unavailable"];

  const filtered = booksData.filter(
    (b) =>
      (filterSubject === "all" || b.subject === filterSubject) &&
      (filterStatus === "all" || b.status === filterStatus)
  );

  const borrowedBooks = booksData.filter((b) => b.borrowed);

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={cardVariants}>
          <div>
            <h1 className="text-3xl font-bold mb-2">Library</h1>
            <p className="text-muted-foreground">
              Browse books and manage your borrowed items
            </p>
          </div>
        </motion.div>

        {/* Borrowed Books Summary */}
        {borrowedBooks.length > 0 && (
          <motion.div variants={cardVariants}>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-blue-600" size={24} />
                  <div>
                    <p className="font-semibold text-blue-900">
                      You have {borrowedBooks.length} borrowed book(s)
                    </p>
                    <p className="text-sm text-blue-700">
                      {borrowedBooks
                        .map((b) => `${b.title} due ${b.dueDate}`)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">
                    Filter by Subject
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <Button
                        key={subject}
                        variant={
                          filterSubject === subject ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setFilterSubject(subject)}
                      >
                        {subject === "all" ? "All Subjects" : subject}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">
                    Filter by Availability
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <Button
                        key={status}
                        variant={
                          filterStatus === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setFilterStatus(status)}
                      >
                        {status === "all"
                          ? "All Status"
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Books Grid */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((book) => (
            <motion.div key={book.id} variants={cardVariants}>
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{book.title}</CardTitle>
                      <CardDescription>{book.author}</CardDescription>
                    </div>
                    <Badge
                      className={
                        statusConfig[book.status as keyof typeof statusConfig]
                          .color
                      }
                    >
                      {
                        statusConfig[book.status as keyof typeof statusConfig]
                          .label
                      }
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {book.subject}
                    </p>
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm text-muted-foreground">
                        Availability
                      </p>
                      <p className="text-2xl font-bold">
                        {book.available}/{book.total}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {book.borrowed ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                        >
                          Return
                        </Button>
                        <Button variant="ghost" className="flex-1">
                          Renew
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant={book.available > 0 ? "default" : "outline"}
                        className="w-full"
                        disabled={book.available === 0}
                      >
                        {book.available > 0 ? "Borrow" : "Unavailable"}
                      </Button>
                    )}
                  </div>

                  {book.borrowed && (
                    <p className="text-xs text-amber-600 mt-2">
                      Due: {new Date(book.dueDate!).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
