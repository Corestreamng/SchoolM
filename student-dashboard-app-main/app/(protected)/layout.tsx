"use client";

import { AuthGuard } from "@/components/auth-guard";
import DashboardLayout from "@/app/dashboard-layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
      {/* <DashboardLayout>{children}</DashboardLayout> */}
    </AuthGuard>
  );
}
