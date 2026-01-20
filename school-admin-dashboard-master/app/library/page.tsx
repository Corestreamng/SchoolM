"use client"

import Sidebar from "@/components/sidebar"
import TopNav from "@/components/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, Eye } from "lucide-react"
import { useState } from "react"

interface BorrowRecord {
  id: string
  studentName: string
  bookTitle: string
  borrowDate: string
  dueDate: string
  status: "borrowed" | "returned"
}

const mockBooks = [
  {
    id: "1",
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    isbn: "978-0435905669",
    quantity: 5,
    available: 3,
    category: "Literature",
  },
  {
    id: "2",
    title: "Mathematics for Engineers",
    author: "K.A Stroud",
    isbn: "978-0831134488",
    quantity: 8,
    available: 5,
    category: "Science",
  },
  {
    id: "3",
    title: "The Physics of Everyday Phenomena",
    author: "W. Thomas Griffith",
    isbn: "978-0073532134",
    quantity: 6,
    available: 2,
    category: "Science",
  },
  {
    id: "4",
    title: "English Grammar in Use",
    author: "Raymond Murphy",
    isbn: "978-1107539334",
    quantity: 10,
    available: 7,
    category: "Language",
  },
  {
    id: "5",
    title: "Advanced Chemistry",
    author: "N.N Tuli",
    isbn: "978-8126910695",
    quantity: 4,
    available: 1,
    category: "Science",
  },
]

const mockBorrowRecords = [
  {
    id: "1",
    studentName: "John Adekunle",
    bookTitle: "Things Fall Apart",
    borrowDate: "2025-01-15",
    dueDate: "2025-02-15",
    status: "borrowed",
  },
  {
    id: "2",
    studentName: "Sarah Okafor",
    bookTitle: "Mathematics for Engineers",
    borrowDate: "2025-01-10",
    dueDate: "2025-02-10",
    status: "borrowed",
  },
  {
    id: "3",
    studentName: "Chioma Nwankwo",
    bookTitle: "English Grammar in Use",
    borrowDate: "2024-12-20",
    dueDate: "2025-01-20",
    status: "returned",
  },
]

export default function LibraryPage() {
  const [books, setBooks] = useState(mockBooks)
  const [borrowRecords, setBorrowRecords] = useState(mockBorrowRecords)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>("all")

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || book.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const totalBooks = books.reduce((sum, book) => sum + book.quantity, 0)
  const totalAvailable = books.reduce((sum, book) => sum + book.available, 0)
  const activeBorrows = borrowRecords.filter((r) => r.status === "borrowed").length

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopNav />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Library</h1>
                <p className="text-muted-foreground mt-2">Manage library inventory and borrowing</p>
              </div>
              <Button className="gap-2">
                <Plus size={18} />
                Add Book
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Books</p>
                    <p className="text-2xl font-bold text-primary mt-2">{totalBooks}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Books</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{totalAvailable}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Borrows</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">{activeBorrows}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="inventory" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="inventory" className="gap-2">
                  <Eye size={16} />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="borrowing">Borrowing History</TabsTrigger>
              </TabsList>

              <TabsContent value="inventory" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Book Collection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        placeholder="Search books..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>ISBN</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="w-10">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBooks.map((book) => (
                            <TableRow key={book.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium">{book.title}</TableCell>
                              <TableCell className="text-sm">{book.author}</TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">{book.isbn}</TableCell>
                              <TableCell>{book.quantity}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    book.available > 0 ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"
                                  }
                                >
                                  {book.available}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{book.category}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal size={16} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="gap-2 cursor-pointer">View Details</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="borrowing" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Borrow Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Book Title</TableHead>
                            <TableHead>Borrow Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {borrowRecords.map((record) => (
                            <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="font-medium">{record.studentName}</TableCell>
                              <TableCell>{record.bookTitle}</TableCell>
                              <TableCell className="text-sm">
                                {new Date(record.borrowDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-sm">{new Date(record.dueDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    record.status === "borrowed"
                                      ? "bg-blue-500/20 text-blue-700"
                                      : "bg-green-500/20 text-green-700"
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
