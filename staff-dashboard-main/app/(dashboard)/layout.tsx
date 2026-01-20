"use client"

import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageTransition } from "@/components/page-transition"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <DashboardLayout>
        <PageTransition>{children}</PageTransition>
      </DashboardLayout>
    </AuthGuard>
  )
}
