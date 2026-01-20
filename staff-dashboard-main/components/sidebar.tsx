"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  FileText,
  Users,
  BookOpen,
  MessageSquare,
  DollarSign,
  History,
  FileCheck,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";

const getTeacherMenuItems = (t: (key: string) => string) => [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/schedule", labelKey: "nav.schedule", icon: Calendar },
  { href: "/performance", labelKey: "nav.performance", icon: BarChart3 },
  { href: "/assignments", labelKey: "nav.assignments", icon: FileText },
  { href: "/attendance", labelKey: "nav.attendance", icon: Users },
  { href: "/grades", labelKey: "nav.grades", icon: FileCheck },
  { href: "/cbt", labelKey: "nav.cbt", icon: BarChart3 },
  { href: "/library", labelKey: "nav.library", icon: BookOpen },
  { href: "/messages", labelKey: "nav.messages", icon: MessageSquare },
];

const getCashierMenuItems = (t: (key: string) => string) => [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/fees", labelKey: "nav.fees", icon: DollarSign },
  { href: "/payments", labelKey: "nav.payments", icon: History },
  { href: "/invoices", labelKey: "nav.invoices", icon: FileCheck },
  { href: "/fee-structure", labelKey: "nav.feeStructure", icon: Settings },
  { href: "/reports", labelKey: "nav.reports", icon: BarChart3 },
  { href: "/messages", labelKey: "nav.messages", icon: MessageSquare },
];

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const menuItems =
    user?.role === "teacher" ? getTeacherMenuItems(t) : getCashierMenuItems(t);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card hover:bg-secondary transition-colors border border-border"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-40 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground">CoreSkool</h1>
            <p className="text-sm text-muted-foreground mt-1">Staff Portal</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={20} />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
