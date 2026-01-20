"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  User,
  Globe,
  LayoutDashboard,
  Calendar,
  TrendingUp,
  FileText,
  ClipboardCheck,
  CheckCircle,
  CreditCard,
  Monitor,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import EditProfileModal from "@/components/edit-profile-modal";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getMenuItems = (t: (key: string) => string) => [
  { labelKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { labelKey: "nav.timetable", href: "/timetable", icon: Calendar },
  { labelKey: "nav.grades", href: "/grades", icon: TrendingUp },
  { labelKey: "nav.results", href: "/results", icon: FileText },
  { labelKey: "nav.assignments", href: "/assignments", icon: ClipboardCheck },
  { labelKey: "nav.attendance", href: "/attendance", icon: CheckCircle },
  { labelKey: "nav.payments", href: "/payments", icon: CreditCard },
  { labelKey: "nav.cbt", href: "/cbt", icon: Monitor },
  { labelKey: "nav.library", href: "/library", icon: BookOpen },
  { labelKey: "nav.messages", href: "/messages", icon: MessageSquare },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const menuItems = getMenuItems(t);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-primary">CoreSkool</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon size={20} />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-foreground"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative w-80">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-muted border-muted"
                  type="search"
                />
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <Select
              value={language}
              onValueChange={(value: "en" | "ar") => setLanguage(value)}
            >
              <SelectTrigger className="w-[120px]">
                <Globe size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("common.english")}</SelectItem>
                <SelectItem value="ar">{t("common.arabic")}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" className="text-foreground">
              <Bell size={20} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <User size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                  {t("common.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem>{t("common.settings")}</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut size={16} className="mr-2" />
                  {t("common.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
      <EditProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </div>
  );
};

export default DashboardLayout;
