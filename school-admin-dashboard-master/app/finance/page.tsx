"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  More,
  Trash,
  Eye,
  SearchNormal,
  Edit,
  Add,
  DocumentDownload,
} from "iconsax-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { usePayments } from "@/hooks/use-payments";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadIcon } from "lucide-react";

const revenueData = [
  { month: "Jan", fees: 450000, expenses: 120000 },
  { month: "Feb", fees: 480000, expenses: 125000 },
  { month: "Mar", fees: 520000, expenses: 130000 },
  { month: "Apr", fees: 490000, expenses: 128000 },
  { month: "May", fees: 550000, expenses: 135000 },
  { month: "Jun", fees: 580000, expenses: 140000 },
];

export default function FinancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: paymentsData, isLoading } = usePayments({
    student_id: searchTerm ? parseInt(searchTerm) : undefined,
    status: undefined,
    payment_type: undefined,
    per_page: 10,
  });

  const payments = paymentsData?.data || [];

  const filteredPayments = payments.filter(
    (payment) =>
      payment.student?.user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.fees, 0);
  const totalExpenses = revenueData.reduce(
    (sum, item) => sum + item.expenses,
    0
  );
  const paidPayments = payments.filter((p) => p.status === "completed").length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;

  const statusColors = {
    completed: "bg-green-500/20 text-green-700",
    pending: "bg-yellow-500/20 text-yellow-700",
    failed: "bg-red-500/20 text-red-700",
    refunded: "bg-gray-500/20 text-gray-700",
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <TopNav />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Finance</h1>
                <p className="text-muted-foreground mt-2">
                  Manage school finances and payments
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">
                      ₦{totalRevenue.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">
                      ₦{totalExpenses.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Paid Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">
                      {paidPayments}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">
                      {pendingPayments}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle>Revenue & Expenses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={revenueData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--color-border)"
                            />
                            <XAxis
                              stroke="var(--color-muted-foreground)"
                              dataKey="month"
                            />
                            <YAxis stroke="var(--color-muted-foreground)" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--color-card)",
                                border: "1px solid var(--color-border)",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="fees"
                              stroke="var(--color-primary)"
                              name="Revenue"
                            />
                            <Line
                              type="monotone"
                              dataKey="expenses"
                              stroke="var(--color-destructive)"
                              name="Expenses"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle>Monthly Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={revenueData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--color-border)"
                            />
                            <XAxis
                              stroke="var(--color-muted-foreground)"
                              dataKey="month"
                            />
                            <YAxis stroke="var(--color-muted-foreground)" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--color-card)",
                                border: "1px solid var(--color-border)",
                              }}
                            />
                            <Bar
                              dataKey="fees"
                              fill="var(--color-primary)"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>Payment Records</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <SearchNormal
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          size={18}
                        />
                        <Input
                          placeholder="Search by student name or transaction ID..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                      ) : (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Payment Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-10">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                  <TableRow
                                    key={payment.id}
                                    className="hover:bg-muted/50 transition-colors"
                                  >
                                    <TableCell className="font-medium">
                                      {payment.student?.user?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      {payment.payment_type || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      ₦{payment.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                      {payment.due_date
                                        ? new Date(
                                            payment.due_date
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={
                                          statusColors[
                                            payment.status as keyof typeof statusColors
                                          ] || statusColors.pending
                                        }
                                      >
                                        {payment.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                          >
                                            <More size={16} />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem className="gap-2 cursor-pointer">
                                            <Eye size={16} />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="gap-2 cursor-pointer">
                                            <DownloadIcon size={16} />
                                            Download Receipt
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={6}
                                    className="text-center py-8 text-muted-foreground"
                                  >
                                    No payments found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
