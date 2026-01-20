"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendUp } from "iconsax-react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/language-context";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { t } = useLanguage();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Top Navigation */}
          <TopNav />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {t("dashboard.title")}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t("dashboard.welcome")}!{" "}
                  {t("dashboard.overview") || "Here's your school overview."}
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="bg-card border-border">
                        <CardHeader className="pb-3">
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-8 w-32 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </CardContent>
                      </Card>
                    ))
                  : stats?.kpis.map((card) => (
                      <Card
                        key={card.label}
                        className="bg-card border-border hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              {card.label}
                            </CardTitle>
                            <span className="text-2xl">{card.icon}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-foreground">
                            {card.value}
                          </p>
                          <p className="text-xs text-primary flex items-center gap-1 mt-2">
                            <TrendUp size={12} />
                            {card.change}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>{t("dashboard.monthlyRevenue")}</CardTitle>
                    <CardDescription>
                      {t("dashboard.revenueTrends") ||
                        "Revenue trends over the last 6 months"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats?.monthlyRevenue || []}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                          />
                          <XAxis stroke="var(--color-muted-foreground)" />
                          <YAxis stroke="var(--color-muted-foreground)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--color-card)",
                              border: "1px solid var(--color-border)",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--color-primary)"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Student Growth Chart */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>{t("dashboard.studentGrowth")}</CardTitle>
                    <CardDescription>
                      {t("dashboard.newRegistrations") ||
                        "New student registrations per month"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.studentGrowth || []}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                          />
                          <XAxis stroke="var(--color-muted-foreground)" />
                          <YAxis stroke="var(--color-muted-foreground)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--color-card)",
                              border: "1px solid var(--color-border)",
                            }}
                          />
                          <Bar
                            dataKey="students"
                            fill="var(--color-primary)"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Performance Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Students */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>{t("dashboard.topStudents")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {stats?.topStudents && stats.topStudents.length > 0 ? (
                          stats.topStudents.map((student, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-muted transition-colors"
                            >
                              <div>
                                <p className="font-medium text-sm text-foreground">
                                  {student.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {student.subject}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-primary">
                                {student.score}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            {t("dashboard.noStudentData") ||
                              "No student data available"}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Teachers */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>{t("dashboard.topTeachers")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {stats?.topTeachers && stats.topTeachers.length > 0 ? (
                          stats.topTeachers.map((teacher, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-muted transition-colors"
                            >
                              <div>
                                <p className="font-medium text-sm text-foreground">
                                  {teacher.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {teacher.subject}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-primary">
                                {teacher.rating}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            {t("dashboard.noTeacherData") ||
                              "No teacher data available"}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
