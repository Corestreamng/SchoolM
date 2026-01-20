"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Sidebar />
      <Topbar />
      <main className="lg:ml-64 pt-20 pb-8 min-h-screen">
        <div className="px-4 md:px-8 lg:px-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </AuthGuard>
  );
}

